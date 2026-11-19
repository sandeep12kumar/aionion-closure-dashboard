import toast from 'react-hot-toast';

/** Toast after a decision, including whether the client email went out. */
export const showDecisionResult = (clientCode, res) => {
  const mail = res?.data?.mail;
  const label = res?.data?.label || 'Saved';
  if (!mail) {
    toast.success(`${clientCode}: marked as ${label}.`);
  } else if (mail.status === 'SENT') {
    toast.success(`${clientCode}: marked as ${label}. Email sent to ${mail.to}.`, { duration: 5000 });
  } else {
    toast.success(`${clientCode}: marked as ${label}.`);
    toast.error(
      mail.status === 'FAILED'
        ? `Client email could not be sent to ${mail.to}. Please inform the client.`
        : `Client email not sent: ${mail.error}.`,
      { duration: 8000 },
    );
  }
};
