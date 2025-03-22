import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTPEmail = async (email,otp,username) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code for signup",
        html: `<p>Hi,${username} </p>
<p>To verify your account, please enter this one-time password (OTP):</p>



<p style="font-size: 24px; font-weight: bold;">${otp}</p>


<p>This code is valid for 5 minutes</p>



<p>If you did not request this verification, please ignore this email.</p>



<p>Thanks, </p>

<p>Track Notes</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}`);
}

// by default 5 minuts 
/**
 * diff between transporter and creat Transport
 */
