import React, { useState } from 'react';
import { submitDonorIntent } from '../services/api';
import './DonorIntentForm.css';

interface FormState {
  donorIntent: string;
  amount: string;
  email: string;
  isPublic: boolean;
}

const DonorIntentForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    donorIntent: '',
    amount: '',
    email: '',
    isPublic: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!form.donorIntent.trim()) {
      setError('Please share a short message from your heart.');
      return;
    }
    if (!form.email.trim()) {
      setError('Please enter your email to receive a receipt.');
      return;
    }
    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid amount in CAD.');
      return;
    }

    setSubmitting(true);
    try {
      await submitDonorIntent({
        donorIntent: form.donorIntent.trim(),
        amountFiat: amountNum,
        currency: 'CAD',
        donorEmail: form.email.trim(),
        isPublic: form.isPublic,
      });
      setConfirmed(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmed) {
    return (
      <section className="intent-wrapper">
        <div className="intent-card">
          <h1 className="intent-title">Thank you.</h1>
          <p className="intent-lead">
            You just funded real change. And here’s what you said that made it happen:
          </p>
          <blockquote className="intent-quote" aria-live="polite">“{form.donorIntent}”</blockquote>
          <a
            href="https://testnet.xrpl.org/transactions/mocktx123"
            target="_blank"
            rel="noopener noreferrer"
            className="intent-link"
          >
            View your transaction
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="intent-wrapper">
      <form onSubmit={handleSubmit} className="intent-card" noValidate>
        <h1 className="intent-title">Share what’s on your heart</h1>
        <p className="intent-lead">A few words about why you’re giving helps carry this gift further.</p>

        {error && (
          <div role="alert" className="intent-error">{error}</div>
        )}

        <div className="intent-field">
          <label htmlFor="donorIntent" className="intent-label">Your message</label>
          <textarea
            id="donorIntent"
            name="donorIntent"
            required
            rows={4}
            placeholder="For girls who never had a laptop."
            value={form.donorIntent}
            onChange={handleChange}
            className="intent-textarea"
          />
        </div>

        <div className="intent-field">
          <label htmlFor="amount" className="intent-label">Amount (CAD)</label>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            min={1}
            step="0.01"
            placeholder="25.00"
            value={form.amount}
            onChange={handleChange}
            className="intent-input"
            aria-describedby="amount-help"
          />
          <small id="amount-help" className="intent-help">Your receipt will show the amount in CAD.</small>
        </div>

        <div className="intent-field">
          <label htmlFor="email" className="intent-label">Email for your receipt</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="intent-input"
          />
        </div>

        <div className="intent-field intent-checkbox-row">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            checked={form.isPublic}
            onChange={handleChange}
            className="intent-checkbox"
          />
          <label htmlFor="isPublic" className="intent-checkbox-label">Allow this charity to know who I am</label>
        </div>

        <button type="submit" disabled={submitting} className={`intent-button ${submitting ? 'disabled' : ''}`}>
          {submitting ? 'Sending…' : 'Give now'}
        </button>
      </form>
    </section>
  );
};

export default DonorIntentForm;




