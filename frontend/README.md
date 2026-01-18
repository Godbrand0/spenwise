# Environment Variables Setup

This project uses environment variables for configuration. Follow these steps to set up your environment:

## 1. Create your local environment file

Copy the example environment file to create your local configuration:

```bash
cp .env.example .env.local
```

## 2. Configure your secrets

Edit `.env.local` with your actual values:

- `CRON_SECRET`: Generate a secure random string for cron job authentication
- `GEMINI_API_KEY`: Your Google AI Studio API key
- `EMAIL_API_KEY`: Your email service API key (Resend/SendGrid)
- `FROM_EMAIL`: Email address for sending notifications

## 3. Security Notes

- **Never commit `.env.local` to version control** - it's already included in `.gitignore`
- Only `.env.example` should be committed as a template
- For production deployment, set these environment variables in your hosting platform (Vercel, etc.)

## 4. Generating a Cron Secret

To generate a secure cron secret, run one of these commands:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

## 5. Vercel Deployment

When deploying to Vercel:

1. Go to your project settings → Environment Variables
2. Add all the variables from your `.env.local`
3. Make sure to include them in the appropriate environments (Production, Preview, Development)

## Environment Variable Priority

Next.js loads environment variables in this order:

1. `.env.production.local` (Production only)
2. `.env.development.local` (Development only)
3. `.env.local` (All environments)
4. `.env.production` (Production only)
5. `.env.development` (Development only)
6. `.env` (All environments)

This project is configured to use `.env.local` for all sensitive configuration.
