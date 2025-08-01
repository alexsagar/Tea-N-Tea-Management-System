import express from 'express';
import { authMiddleware, checkPermission } from '../middleware/auth.js';

const router = express.Router();

let templates = {
  email: {
    orderConfirmation: {
      subject: 'Order Confirmation - {{orderNumber}}',
      body: 'Dear {{customerName}}, your order {{orderNumber}} has been confirmed. Total: {{total}}. Thank you!'
    },
    orderReady: {
      subject: 'Order Ready - {{orderNumber}}',
      body: 'Dear {{customerName}}, your order {{orderNumber}} is ready for pickup/delivery.'
    }
  },
  sms: {
    orderConfirmation: {
      message: 'Order {{orderNumber}} confirmed. Total: {{total}}. Thank you!'
    },
    orderReady: {
      message: 'Order {{orderNumber}} is ready for pickup/delivery.'
    }
  }
};

// Get all notification templates (in production, use MongoDB with shopId)
router.get('/templates', authMiddleware, async (req, res) => {
  try {
    res.json(templates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update email template
router.put('/templates/email/:type', authMiddleware, checkPermission('notifications', 'update'), async (req, res) => {
  try {
    const { type } = req.params;
    const { subject, body } = req.body;

    if (!templates.email[type]) {
      return res.status(404).json({ message: 'Template not found' });
    }

    templates.email[type] = { subject, body };
    res.json(templates.email[type]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update SMS template
router.put('/templates/sms/:type', authMiddleware, checkPermission('notifications', 'update'), async (req, res) => {
  try {
    const { type } = req.params;
    const { message } = req.body;

    if (!templates.sms[type]) {
      return res.status(404).json({ message: 'Template not found' });
    }

    templates.sms[type] = { message };
    res.json(templates.sms[type]);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send notification
router.post('/send', authMiddleware, async (req, res) => {
  try {
    const { type, method, recipient, data } = req.body;
    // You can log shopId if you want: req.user.shopId

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
