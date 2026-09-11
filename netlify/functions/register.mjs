import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const FROM_EMAIL = "registration@starlanguagearts.com";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB

function escapeHtml(value = "") {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getText(formData, name) {
  return formData.get(name)?.toString().trim() || "";
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Method not allowed."
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }

  try {
    const formData = await req.formData();

    // -------------------------------
    // BASIC INFORMATION
    // -------------------------------

    const fullName = getText(formData, "fullName");
    const email = getText(formData, "email");
    const whatsapp = getText(formData, "whatsapp");

    // -------------------------------
    // REGISTRATION INFORMATION
    // -------------------------------

    const attendance = getText(formData, "attendance");
    const profileType = getText(formData, "profileType");

    const improvements = formData
      .getAll("improvements[]")
      .map(value => value.toString());

    const biggestChallenge = getText(
      formData,
      "biggestChallenge"
    );

    const comfortLevel = getText(
      formData,
      "comfortLevel"
    );

    const formalTraining = getText(
      formData,
      "formalTraining"
    );

    const expectedOutcome = getText(
      formData,
      "expectedOutcome"
    );

    const source = getText(formData, "source");

    const improvementOther = getText(
      formData,
      "improvementOther"
    );

    const additionalInfo = getText(
      formData,
      "additionalInfo"
    );

    // -------------------------------
    // PAYMENT INFORMATION
    // -------------------------------

    const paymentReference = getText(
      formData,
      "paymentReference"
    );

    const paymentDate = getText(
      formData,
      "paymentDate"
    );

    const paymentNote = getText(
      formData,
      "paymentNote"
    );

    // -------------------------------
    // REQUIRED FIELDS
    // -------------------------------

    if (!fullName || !email || !whatsapp) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Please complete your personal information."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (!ADMIN_EMAIL) {
      console.error("ADMIN_EMAIL is not configured.");

      return new Response(
        JSON.stringify({
          success: false,
          message: "The registration system is not configured correctly."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // -------------------------------
    // RECEIPT
    // -------------------------------

    const receipt = formData.get("receipt");

    if (!(receipt instanceof File) || receipt.size === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Payment receipt is required."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    if (receipt.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Receipt must be 4 MB or smaller."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf"
    ];

    if (!allowedTypes.includes(receipt.type)) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Receipt must be JPG, PNG or PDF."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Convert uploaded receipt to Base64 for Resend.
    const receiptBuffer = Buffer.from(
      await receipt.arrayBuffer()
    );

    const receiptBase64 = receiptBuffer.toString("base64");

    // -------------------------------
    // FIRST NAME
    // -------------------------------

    const firstName =
      fullName.split(/\s+/)[0] || "there";

    // -------------------------------
    // EMAIL #1 → CUSTOMER
    // -------------------------------

    const customerEmail = await resend.emails.send({
      from: `Star Language Arts <${FROM_EMAIL}>`,
      to: [email],
      replyTo: ADMIN_EMAIL,
      subject:
        "Registration Received — Effective Communication & Public Speaking",

      html: `
        <!DOCTYPE html>
        <html>
        <body style="
          margin:0;
          padding:0;
          background:#f5f7fb;
          font-family:Arial,sans-serif;
          color:#17213f;
        ">

          <div style="
            max-width:600px;
            margin:40px auto;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
          ">

            <div style="
              background:#263d86;
              padding:28px;
              color:white;
            ">
              <h1 style="margin:0;">
                Star Language Arts Ltd
              </h1>
            </div>

            <div style="padding:32px;">

              <h2 style="
                margin-top:0;
                color:#263d86;
              ">
                Thank you, ${escapeHtml(firstName)}!
              </h2>

              <p style="line-height:1.7;">
                Thank you for registering for the
                <strong>
                  Effective Communication &amp; Public Speaking
                </strong>
                program.
              </p>

              <p style="line-height:1.7;">
                We've received your registration and payment receipt.
              </p>

              <p style="line-height:1.7;">
                We'll review your payment and get back to you shortly.
              </p>

              <div style="
                margin-top:24px;
                padding:16px;
                border-left:4px solid #f5a623;
                background:#f8f9fc;
                border-radius:10px;
              ">

                <strong>
                  Registration received
                </strong>

                <p style="
                  margin-bottom:0;
                  color:#66708a;
                  line-height:1.6;
                ">
                  Please keep your payment receipt until
                  your registration has been reviewed.
                </p>

              </div>

              <p style="
                margin-top:30px;
                color:#66708a;
              ">
                We look forward to having you with us.
              </p>

            </div>

            <div style="
              padding:18px 32px;
              background:#f8f9fc;
              color:#7b8498;
              font-size:12px;
            ">
              Star Language Arts Ltd
            </div>

          </div>

        </body>
        </html>
      `
    });

    if (customerEmail.error) {
      console.error(
        "Customer email error:",
        customerEmail.error
      );

      return new Response(
        JSON.stringify({
          success: false,
          message: "Unable to send confirmation email."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // -------------------------------
    // EMAIL #2 → ADMIN
    // WITH RECEIPT ATTACHED
    // -------------------------------

    const adminEmail = await resend.emails.send({
      from: `Star Language Arts <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `New Registration — ${fullName}`,

      html: `
        <!DOCTYPE html>
        <html>
        <body style="
          font-family:Arial,sans-serif;
          color:#17213f;
        ">

          <h2 style="color:#263d86;">
            New Training Registration
          </h2>

          <p>
            A new person has submitted the
            Effective Communication &amp; Public Speaking
            registration form.
          </p>

          <hr>

          <h3>Personal Information</h3>

          <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>WhatsApp:</strong> ${escapeHtml(whatsapp)}</p>

          <h3>Registration</h3>

          <p>
            <strong>Attendance:</strong>
            ${escapeHtml(attendance)}
          </p>

          <p>
            <strong>Participant type:</strong>
            ${escapeHtml(profileType)}
          </p>

          <p>
            <strong>Areas to improve:</strong>
            ${escapeHtml(improvements.join(", "))}
          </p>

          <p>
            <strong>Other improvement:</strong>
            ${escapeHtml(improvementOther || "None")}
          </p>

          <p>
            <strong>Biggest challenge:</strong><br>
            ${escapeHtml(biggestChallenge)}
          </p>

          <p>
            <strong>Comfort level:</strong>
            ${escapeHtml(comfortLevel)}
          </p>

          <p>
            <strong>Previous training:</strong>
            ${escapeHtml(formalTraining)}
          </p>

          <p>
            <strong>Expected outcome:</strong><br>
            ${escapeHtml(expectedOutcome)}
          </p>

          <p>
            <strong>How they heard about the class:</strong>
            ${escapeHtml(source)}
          </p>

          <p>
            <strong>Additional information:</strong><br>
            ${escapeHtml(additionalInfo || "None")}
          </p>

          <h3>Payment Information</h3>

          <p>
            <strong>Amount:</strong> ₦25,000
          </p>

          <p>
            <strong>Payment reference:</strong>
            ${escapeHtml(paymentReference)}
          </p>

          <p>
            <strong>Payment date:</strong>
            ${escapeHtml(paymentDate)}
          </p>

          <p>
            <strong>Payment note:</strong>
            ${escapeHtml(paymentNote || "None")}
          </p>

          <hr>

          <p>
            <strong>Receipt:</strong>
            Attached to this email.
          </p>

        </body>
        </html>
      `,

      attachments: [
        {
          filename: receipt.name,
          content: receiptBase64
        }
      ]
    });

    if (adminEmail.error) {
      console.error(
        "Admin email error:",
        adminEmail.error
      );

      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Registration was received, but the admin notification could not be sent."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    console.log(
      "Customer email sent:",
      customerEmail.data?.id
    );

    console.log(
      "Admin email sent:",
      adminEmail.data?.id
    );

    // -------------------------------
    // SUCCESS
    // -------------------------------

    return new Response(
      JSON.stringify({
        success: true,
        message: "Registration submitted successfully."
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {
    console.error(
      "Registration backend error:",
      error
    );

    return new Response(
      JSON.stringify({
        success: false,
        message:
          "Something went wrong while processing your registration."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
};