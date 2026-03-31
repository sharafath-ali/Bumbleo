package auth

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"

	"github.com/sharafath/bumbleo/internal/config"
)

var emailCfg *config.Config

func InitEmail(c *config.Config) {
	emailCfg = c
}

func SendConfirmationEmail(to, token string) error {
	link := fmt.Sprintf("%s/auth/verify?token=%s", emailCfg.FrontendURL, token)
	subject := fmt.Sprintf("Confirm your %s email", emailCfg.AppName)
	body := renderTemplate(confirmTemplate, map[string]string{
		"AppName": emailCfg.AppName,
		"Link":    link,
		"To":      to,
	})
	return sendMail(to, subject, body)
}

func SendPasswordResetEmail(to, token string) error {
	link := fmt.Sprintf("%s/auth/reset?token=%s", emailCfg.FrontendURL, token)
	subject := fmt.Sprintf("Reset your %s password", emailCfg.AppName)
	body := renderTemplate(resetTemplate, map[string]string{
		"AppName": emailCfg.AppName,
		"Link":    link,
		"To":      to,
	})
	return sendMail(to, subject, body)
}

func sendMail(to, subject, htmlBody string) error {
	addr := fmt.Sprintf("%s:%d", emailCfg.SMTPHost, emailCfg.SMTPPort)
	auth := smtp.PlainAuth("", emailCfg.SMTPUser, emailCfg.SMTPPass, emailCfg.SMTPHost)

	msg := []byte(fmt.Sprintf(
		"From: %s <%s>\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
		emailCfg.AppName, emailCfg.SMTPFrom, to, subject, htmlBody,
	))

	return smtp.SendMail(addr, auth, emailCfg.SMTPFrom, []string{to}, msg)
}

func renderTemplate(tmpl string, data map[string]string) string {
	t, err := template.New("email").Parse(tmpl)
	if err != nil {
		return tmpl
	}
	var buf bytes.Buffer
	t.Execute(&buf, data)
	return buf.String()
}

const confirmTemplate = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body{font-family:sans-serif;background:#0f0f1a;color:#fff;margin:0;padding:40px}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;max-width:480px;margin:0 auto}
h1{background:linear-gradient(135deg,#6366f1,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin-bottom:8px}
p{color:rgba(255,255,255,0.7);line-height:1.6}
.btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;margin-top:24px}
.footer{margin-top:32px;font-size:12px;color:rgba(255,255,255,0.3)}
</style></head>
<body>
<div class="card">
  <h1>{{.AppName}}</h1>
  <p>Welcome! Please confirm your email address to start connecting with people around the world.</p>
  <a class="btn" href="{{.Link}}">Confirm Email Address</a>
  <p style="margin-top:20px;font-size:13px;">Or copy this link:<br><span style="color:#a855f7;word-break:break-all">{{.Link}}</span></p>
  <div class="footer">This link expires in 24 hours. If you didn't create a {{.AppName}} account, ignore this email.</div>
</div>
</body>
</html>`

const resetTemplate = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
body{font-family:sans-serif;background:#0f0f1a;color:#fff;margin:0;padding:40px}
.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:40px;max-width:480px;margin:0 auto}
h1{background:linear-gradient(135deg,#6366f1,#a855f7,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:28px;margin-bottom:8px}
p{color:rgba(255,255,255,0.7);line-height:1.6}
.btn{display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;text-decoration:none;border-radius:10px;font-weight:600;margin-top:24px}
.footer{margin-top:32px;font-size:12px;color:rgba(255,255,255,0.3)}
</style></head>
<body>
<div class="card">
  <h1>{{.AppName}}</h1>
  <p>We received a request to reset your password. Click the button below to choose a new password.</p>
  <a class="btn" href="{{.Link}}">Reset Password</a>
  <p style="margin-top:20px;font-size:13px;">Or copy this link:<br><span style="color:#a855f7;word-break:break-all">{{.Link}}</span></p>
  <div class="footer">This link expires in 1 hour. If you didn't request a reset, ignore this email.</div>
</div>
</body>
</html>`
