export const sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  console.log('---------------- RESET EMAIL STUB ----------------');
  console.log(`To: ${email}`);
  console.log(`Reset URL: ${resetUrl}`);
  console.log('--------------------------------------------------');
  return { success: true };
};
