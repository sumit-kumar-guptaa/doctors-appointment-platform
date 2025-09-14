# Environment Configuration Guide

This guide explains how to properly configure all environment variables for the Doctors Appointment Platform.

## Quick Setup

1. Copy `.env.example` to `.env`
```bash
cp .env.example .env
```

2. Fill in your actual credentials (see sections below for details)

## Required Environment Variables

### 1. Authentication (Clerk)
- **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY**: Your Clerk publishable key (safe for client-side)
- **CLERK_SECRET_KEY**: Your Clerk secret key (server-side only)

**Setup Steps:**
1. Create account at [Clerk](https://clerk.com)
2. Create new application
3. Copy keys from Dashboard → API Keys

### 2. Database (PostgreSQL + Prisma)
- **DATABASE_URL**: Prisma Accelerate connection string for production performance
- **DIRECT_URL**: Direct PostgreSQL connection for migrations and admin tasks

**Setup Steps:**
1. Create PostgreSQL database (recommended: [Neon](https://neon.tech) or [PlanetScale](https://planetscale.com))
2. Enable Prisma Accelerate for connection pooling
3. Run migrations: `npx prisma migrate dev`

### 3. Video Calling (Vonage/OpenTok)
- **NEXT_PUBLIC_VONAGE_APPLICATION_ID**: Your Vonage Video application ID (client-safe)
- **VONAGE_API_KEY**: Vonage API key
- **VONAGE_API_SECRET**: Vonage API secret
- **VONAGE_PRIVATE_KEY**: Private key for JWT token generation

**Setup Steps:**
1. Create account at [Vonage Video](https://www.vonage.com/communications-apis/video/)
2. Create Video application
3. Download private key file and copy contents to environment variable

### 4. AI Integration (Optional - Future Features)
- **ANTHROPIC_API_KEY**: For Claude AI integration
- **GEMINI_API_KEY**: For Google Gemini AI integration

**Note**: These are prepared for future AI-powered features like symptom analysis.

## Security Best Practices

1. **Never commit `.env` to version control**
   - `.env` is already in `.gitignore`
   - Use `.env.example` for sharing configuration structure

2. **Use different credentials for different environments**
   - Development
   - Staging  
   - Production

3. **Regularly rotate sensitive keys**
   - Database passwords
   - API keys
   - JWT secrets

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
PORT=3001
```

### Production
```env
NODE_ENV=production
PORT=3000
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` and `DIRECT_URL` are correct
- Ensure database is accessible from your deployment environment
- Check firewall settings for database host

### Authentication Issues
- Confirm Clerk keys are from the correct project
- Verify allowed redirect URLs in Clerk dashboard
- Check middleware configuration for protected routes

### Video Call Issues
- Validate Vonage application ID and keys
- Ensure private key format is correct (including line breaks)
- Check browser permissions for camera/microphone

### General Debugging
- Check application logs for specific error messages
- Use `console.log` to verify environment variables are loaded
- Test with `process.env.VARIABLE_NAME` in server components

## Support

If you encounter issues:
1. Check this configuration guide
2. Review the application logs
3. Verify all environment variables are properly set
4. Test individual components (auth, database, video) separately