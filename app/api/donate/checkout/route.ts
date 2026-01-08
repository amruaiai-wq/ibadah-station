import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  try {
    const body = await request.json();
    const { amount, locale = 'en' } = body;

    // Validate amount (minimum 20 THB or 1 USD)
    if (!amount || amount < 20) {
      return NextResponse.json(
        { error: 'Minimum donation amount is 20 THB' },
        { status: 400 }
      );
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'],
      line_items: [
        {
          price_data: {
            currency: 'thb',
            product_data: {
              name: locale === 'th' ? 'สนับสนุน Ibadah Station' : 'Support Ibadah Station',
              description: locale === 'th'
                ? 'ขอบคุณที่สนับสนุนการพัฒนาแพลตฟอร์มเพื่อการเรียนรู้อิสลาม'
                : 'Thank you for supporting Islamic learning platform development',
              images: [`${origin}/logo.jpg`],
            },
            unit_amount: Math.round(amount * 100), // Convert to satang
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/${locale}?donation=success`,
      cancel_url: `${origin}/${locale}?donation=cancelled`,
      metadata: {
        type: 'donation',
        locale,
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
