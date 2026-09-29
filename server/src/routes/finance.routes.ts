import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { PaymentMethod, DuesType } from "@prisma/client";
import { sendPasscodePaymentEmail } from "../utils/emailService.js";

const router = Router();

const buyPasscodeSchema = z.object({
  email: z.string().email(),
  candidateName: z.string().min(1),
  deviceCount: z.number().int().min(1).default(1),
  durationMonths: z.number().int().min(1).default(1),
  amount: z.number().positive(),
  paymentRef: z.string().optional(),
});

const createDuesSchema = z.object({
  title: z.string().min(3),
  type: z.nativeEnum(DuesType).optional(),
  amount: z.number().positive(),
  academicYear: z.string().optional(),
  description: z.string().optional(),
});

const payDuesSchema = z.object({
  duesItemId: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

const createCampaignSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(5),
  targetAmount: z.number().positive(),
  isActive: z.boolean().optional(),
});

const updateCampaignSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(5).optional(),
  targetAmount: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

const donateSchema = z.object({
  donationCampaignId: z.string().optional(),
  amount: z.number().positive(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

// Memory store for admin override impact stats if any
let customScholarshipsAwarded: number | null = null;

// Interface for Payment Gateway Abstraction
interface PaymentGatewayResult {
  transactionRef: string;
  receiptNumber: string;
  status: "SUCCESSFUL" | "PENDING" | "FAILED";
}

class SimulatedPaymentGateway {
  static async processPayment(amount: number, method: string): Promise<PaymentGatewayResult> {
    const transactionRef = "TXN-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const receiptNumber = "REC-" + Date.now().toString().slice(-6);
    return {
      transactionRef,
      receiptNumber,
      status: "SUCCESSFUL",
    };
  }
}

// GET /api/finance/dues
router.get("/dues", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memberId = req.user!.userId;
    const [duesList, myPayments] = await Promise.all([
      prisma.duesItem.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.paymentRecord.findMany({
        where: { memberId, status: "SUCCESSFUL" },
        select: { duesItemId: true },
      }),
    ]);

    const paidDuesIds = new Set(myPayments.map(p => p.duesItemId).filter(Boolean));

    const result = duesList.map(item => ({
      ...item,
      status: paidDuesIds.has(item.id) ? "PAID" : "PENDING",
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch dues" });
  }
});

// POST /api/finance/dues (Admin create dues amount)
router.post("/dues", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), validateBody(createDuesSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, type, amount, academicYear, description } = req.body;
    const newDues = await prisma.duesItem.create({
      data: {
        title,
        type: type || "ANNUAL_DUES",
        amount,
        academicYear,
        description,
      },
    });
    return res.status(201).json(newDues);
  } catch (err) {
    console.error("Create dues error:", err);
    return res.status(500).json({ error: "Failed to create dues item" });
  }
});

// DELETE /api/finance/dues/:id (Admin delete dues item)
router.delete("/dues/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.duesItem.delete({ where: { id } });
    return res.json({ message: "Dues item deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete dues item" });
  }
});

// GET /api/finance/campaigns (Public & Admin list)
router.get("/campaigns", async (req, res) => {
  try {
    const showAll = req.query.all === "true";
    const whereClause = showAll ? {} : { isActive: true };
    const campaigns = await prisma.donationCampaign.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return res.json(campaigns);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch campaigns" });
  }
});

// POST /api/finance/campaigns (Admin Create Campaign/Cause)
router.post("/campaigns", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), validateBody(createCampaignSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, targetAmount, isActive } = req.body;
    const campaign = await prisma.donationCampaign.create({
      data: {
        title,
        description,
        targetAmount,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    return res.status(201).json(campaign);
  } catch (err) {
    console.error("Create campaign error:", err);
    return res.status(500).json({ error: "Failed to create donation campaign" });
  }
});

// PUT /api/finance/campaigns/:id (Admin Update Cause/Campaign)
router.put("/campaigns/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), validateBody(updateCampaignSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const campaign = await prisma.donationCampaign.update({
      where: { id },
      data: req.body,
    });
    return res.json(campaign);
  } catch (err) {
    console.error("Update campaign error:", err);
    return res.status(500).json({ error: "Failed to update donation campaign" });
  }
});

// DELETE /api/finance/campaigns/:id (Admin Delete Campaign)
router.delete("/campaigns/:id", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.donationCampaign.delete({ where: { id } });
    return res.json({ message: "Donation campaign deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to delete donation campaign" });
  }
});

// POST /api/finance/pay-dues (Stubbed payment gateway)
router.post("/pay-dues", authenticateJWT, validateBody(payDuesSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { duesItemId, paymentMethod } = req.body;
    const memberId = req.user!.userId;

    const duesItem = await prisma.duesItem.findUnique({ where: { id: duesItemId } });
    if (!duesItem) {
      return res.status(404).json({ error: "Dues item not found" });
    }

    const gatewayResult = await SimulatedPaymentGateway.processPayment(
      duesItem.amount,
      paymentMethod || "PAYSTACK"
    );

    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        memberId,
        duesItemId,
        amount: duesItem.amount,
        paymentMethod: paymentMethod || "PAYSTACK",
        transactionRef: gatewayResult.transactionRef,
        receiptNumber: gatewayResult.receiptNumber,
        status: gatewayResult.status,
        paidAt: new Date(),
      },
      include: { duesItem: true },
    });

    return res.status(201).json({
      message: "Dues payment successful",
      payment: paymentRecord,
    });
  } catch (err) {
    return res.status(500).json({ error: "Payment processing failed" });
  }
});

// GET /api/finance/impact-stats (Public live impact stats from DB)
router.get("/impact-stats", async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const [resolvedWelfareCount, donationPayments] = await Promise.all([
      prisma.welfareRequest.count({ where: { status: "RESOLVED" } }),
      prisma.paymentRecord.findMany({
        where: {
          donationCampaignId: { not: null },
          status: "SUCCESSFUL",
        },
        select: { amount: true, memberId: true, createdAt: true },
      }),
    ]);

    const totalDonationsAmount = donationPayments.reduce((sum, p) => sum + p.amount, 0);
    const donorsThisYear = new Set(
      donationPayments.filter(p => new Date(p.createdAt) >= startOfYear).map(p => p.memberId)
    ).size;

    return res.json({
      membersSupported: resolvedWelfareCount,
      scholarshipsAwarded: customScholarshipsAwarded !== null ? customScholarshipsAwarded : 0,
      totalDonationsAmount,
      donorsThisYear,
    });
  } catch (err) {
    console.error("Fetch impact stats error:", err);
    return res.status(500).json({ error: "Failed to fetch impact statistics" });
  }
});

// PUT /api/admin/impact-stats (Admin update custom impact stats)
router.put("/admin/impact-stats", authenticateJWT, requireRole("ADMIN", "SUPER_ADMIN", "FINANCE_ADMIN"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { scholarshipsAwarded } = req.body;
    if (scholarshipsAwarded !== undefined) {
      customScholarshipsAwarded = Number(scholarshipsAwarded);
    }
    return res.json({ scholarshipsAwarded: customScholarshipsAwarded });
  } catch (err) {
    return res.status(500).json({ error: "Failed to update impact stats" });
  }
});

// POST /api/finance/donate (Stubbed payment gateway)
router.post("/donate", authenticateJWT, validateBody(donateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    let { donationCampaignId, amount, paymentMethod } = req.body;
    const memberId = req.user!.userId;

    let campaign: any = null;
    if (donationCampaignId) {
      campaign = await prisma.donationCampaign.findUnique({ where: { id: donationCampaignId } }).catch(() => null);
    }

    if (!campaign) {
      // Find first active campaign or create default
      campaign = await prisma.donationCampaign.findFirst({ where: { isActive: true } });
      if (!campaign) {
        campaign = await prisma.donationCampaign.create({
          data: {
            title: "General Alumni Fund",
            description: "Support alumni association projects and community welfare",
            targetAmount: 5000000,
            isActive: true,
          },
        });
      }
    }

    const gatewayResult = await SimulatedPaymentGateway.processPayment(
      amount,
      paymentMethod || "PAYSTACK"
    );

    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        memberId,
        donationCampaignId: campaign.id,
        amount,
        paymentMethod: paymentMethod || "PAYSTACK",
        transactionRef: gatewayResult.transactionRef,
        receiptNumber: gatewayResult.receiptNumber,
        status: gatewayResult.status,
        paidAt: new Date(),
      },
      include: { donationCampaign: true },
    });

    // Update campaign raised total
    await prisma.donationCampaign.update({
      where: { id: campaign.id },
      data: { raisedAmount: { increment: amount } },
    });

    return res.status(201).json({
      message: "Donation processed successfully. Thank you for your contribution!",
      payment: paymentRecord,
    });
  } catch (err) {
    return res.status(500).json({ error: "Donation failed" });
  }
});

// GET /api/finance/history (Member's payment records & receipts)
router.get("/history", authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const history = await prisma.paymentRecord.findMany({
      where: { memberId: req.user!.userId },
      include: { duesItem: true, donationCampaign: true, proofMedia: true },
      orderBy: { createdAt: "desc" },
    });
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch payment history" });
  }
});

// POST /api/finance/buy-passcode (Purchase passcode & dispatch email notification)
router.post("/buy-passcode", validateBody(buyPasscodeSchema), async (req, res) => {
  try {
    const { email, candidateName, deviceCount, durationMonths, amount, paymentRef } = req.body;

    const generatedPasscode = "PASS-" + Math.floor(100000 + Math.random() * 900000);
    const ref = paymentRef || "PASS-TXN-" + Date.now();

    // Trigger SMTP email sending helper asynchronously
    await sendPasscodePaymentEmail({
      toEmail: email,
      candidateName,
      passcode: generatedPasscode,
      deviceCount,
      durationMonths,
      amount,
      paymentRef: ref,
    });

    return res.status(201).json({
      message: "Passcode purchased successfully and confirmation email sent.",
      passcode: generatedPasscode,
      email,
      deviceCount,
      amount,
      paymentRef: ref,
    });
  } catch (err) {
    console.error("Passcode purchase error:", err);
    return res.status(500).json({ error: "Failed to process passcode purchase" });
  }
});

export default router;
