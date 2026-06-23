from typing import Optional
from app.core.config import settings

async def send_email(to_email: str, subject: str, body: str, attachment_path: Optional[str] = None) -> bool:
    """
    Send an email via SendGrid, with a graceful mock fallback.
    """
    if not settings.SENDGRID_API_KEY or settings.SENDGRID_API_KEY == "your_sendgrid_api_key_here":
        print(f"--- MOCK EMAIL DISPATCHED ---")
        print(f"To: {to_email}")
        print(f"From: {settings.SENDGRID_FROM_EMAIL or 'noreply@civicpulse.org'}")
        print(f"Subject: {subject}")
        print(f"Body: {body[:300]}...")
        if attachment_path:
            print(f"Attachment: {attachment_path}")
        print(f"-----------------------------")
        return True

    # Real SendGrid integration
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Attachment, FileContent, FileName, FileType, Disposition
        import base64
        import os

        message = Mail(
            from_email=settings.SENDGRID_FROM_EMAIL or 'noreply@civicpulse.org',
            to_emails=to_email,
            subject=subject,
            plain_text_content=body
        )

        if attachment_path and os.path.exists(attachment_path):
            with open(attachment_path, 'rb') as f:
                data = f.read()
                
            encoded_file = base64.b64encode(data).decode()
            filename = os.path.basename(attachment_path)
            
            attached_file = Attachment(
                FileContent(encoded_file),
                FileName(filename),
                FileType('application/pdf'),
                Disposition('attachment')
            )
            message.attachment = attached_file

        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        return response.status_code == 202
        
    except Exception as e:
        print(f"ERROR: SendGrid email failed: {e}. Falling back to mock logger.")
        return False

async def send_sms(phone_number: str, message: str) -> bool:
    """
    Send an SMS via Twilio, with a graceful mock fallback.
    """
    if not settings.TWILIO_ACCOUNT_SID or settings.TWILIO_ACCOUNT_SID == "your_twilio_sid_here":
        print(f"--- MOCK SMS DISPATCHED ---")
        print(f"To: {phone_number}")
        print(f"From: {settings.TWILIO_FROM_NUMBER or 'CivicPulse'}")
        print(f"Message: {message}")
        print(f"---------------------------")
        return True

    # Real Twilio integration
    try:
        from twilio.rest import Client
        
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        
        # Enforce international format mock fallback if needed
        to_phone = phone_number if phone_number.startswith("+") else f"+91{phone_number}"
        
        client.messages.create(
            body=message,
            from_=settings.TWILIO_FROM_NUMBER,
            to=to_phone
        )
        return True
        
    except Exception as e:
        print(f"ERROR: Twilio SMS failed: {e}. Falling back to mock logger.")
        return False
