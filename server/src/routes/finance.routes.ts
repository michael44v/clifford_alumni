import { Router, Response } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { authenticateJWT, requireRole, AuthenticatedRequest } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import { PaymentMethod, DuesType } from "@prisma/client";

const router = Router();

const createDuesSchema = z.object({
  title: z.string().min(3),
  type: z.nativeEnum(DuesType).optional(),
  amount: z.number().positive(),
  academicYear: z.string().optional(),
  description: z.string().optional(),
});

const payDuesSchema = z.object({
  duesItemId: z.string().uuid(),
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
  donationCampaignId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
});

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

// POST /api/finance/donate (Stubbed payment gateway)
router.post("/donate", authenticateJWT, validateBody(donateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { donationCampaignId, amount, paymentMethod } = req.body;
    const memberId = req.user!.userId;

    const campaign = await prisma.donationCampaign.findUnique({ where: { id: donationCampaignId } });
    if (!campaign) {
      return res.status(404).json({ error: "Donation campaign not found" });
    }

    const gatewayResult = await SimulatedPaymentGateway.processPayment(
      amount,
      paymentMethod || "PAYSTACK"
    );

    const paymentRecord = await prisma.paymentRecord.create({
      data: {
        memberId,
        donationCampaignId,
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
      where: { id: donationCampaignId },
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

export default router;
