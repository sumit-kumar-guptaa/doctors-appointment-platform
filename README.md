# 🏥 MediMeet - Revolutionary Healthcare Platform

![MediMeet Banner](./public/banner.png)

> **The Future of Healthcare, Delivered Today**

MediMeet is a cutting-edge healthcare platform that revolutionizes how patients connect with medical professionals through AI-powered matching, seamless telemedicine, and comprehensive health management.

[![Next.js](https://img.shields.io/badge/Next.js-15.3.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C5CE7?logo=clerk)](https://clerk.com/)

## 🚀 Features

### 🧬 **Smart Health Onboarding**
- AI-powered health profile creation
- Personalized healthcare roadmaps
- Intelligent symptom analysis
- Medical history digitization

### 🤖 **AI-Powered Doctor Matching**
- Advanced matching algorithms
- Specialty-based recommendations
- Insurance compatibility checks
- Patient review integration

### 📅 **Intelligent Scheduling**
- Real-time availability tracking
- Multi-timezone support
- Automated reminders
- Calendar integrations

### 🔬 **Next-Gen Telemedicine**
- HD video consultations
- Real-time health data sharing
- Digital prescription management
- HIPAA-compliant platform

### 📊 **Comprehensive Health Hub**
- Complete medical history tracking
- Lab result management
- Prescription monitoring
- Health insights dashboard

### 💎 **Continuous Care Excellence**
- Automated follow-up systems
- Health trend analysis
- Care team coordination
- Wellness plan management

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15.3.2 with App Router
- **Language**: JavaScript/TypeScript
- **Styling**: Tailwind CSS with custom color system
- **UI Components**: Shadcn/ui + Aceternity UI
- **Animations**: Framer Motion
- **Icons**: Tabler Icons, Lucide React

### **Backend & Database**
- **Database**: PostgreSQL with Neon DB
- **ORM**: Prisma
- **Authentication**: Clerk
- **File Storage**: Cloudinary (configured)

### **Deployment & DevOps**
- **Hosting**: Vercel-ready
- **Environment**: Node.js 18+
- **Package Manager**: npm/yarn
- **Build Tool**: Turbopack

## 🎨 Design System

### **Color Palette**
```css
/* Primary Colors */
--purple-600: #9333ea    /* Primary brand color */
--orange-500: #f97316    /* Secondary accent */
--emerald-500: #10b981   /* Success/medical */

/* Gradients */
background: linear-gradient(to right, #9333ea, #f97316);
```

### **Key Components**
- **Medical Lamp Hero**: Aceternity lamp effect with centered content
- **Interactive Sidebar**: Role-based navigation system
- **Patient Testimonials**: Infinite scroll testimonials
- **How It Works**: Interactive card hover effects
- **Pricing Cards**: Credit-based subscription system

## 🏗️ Project Structure

```
doctors-appointment-platform/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 (auth)/                   # Authentication pages
│   │   ├── 📁 sign-in/              # Clerk sign-in
│   │   └── 📁 sign-up/              # Clerk sign-up
│   ├── 📁 (main)/                   # Main application
│   │   ├── 📁 admin/                # Admin dashboard
│   │   ├── 📁 appointments/         # Appointment management
│   │   ├── 📁 doctor/               # Doctor dashboard
│   │   ├── 📁 doctors/              # Doctor listings
│   │   ├── 📁 medical-history/      # Patient medical records
│   │   ├── 📁 onboarding/           # User role selection
│   │   ├── 📁 pricing/              # Subscription plans
│   │   └── 📁 video-call/           # Telemedicine interface
│   ├── globals.css                  # Global styles + custom utilities
│   ├── layout.js                    # Root layout with theme provider
│   └── page.js                      # Landing page
├── 📁 components/                   # Reusable UI components
│   ├── 📁 ui/                       # Shadcn + Aceternity components
│   │   ├── card-hover-effect.jsx    # Interactive cards
│   │   ├── infinite-moving-cards.jsx # Testimonial carousel
│   │   ├── lamp.jsx                 # Hero lamp effect
│   │   └── sidebar.jsx              # Navigation sidebar
│   ├── doctors-sidebar.jsx          # Role-based sidebar
│   ├── footer.jsx                   # Interactive footer
│   ├── how-it-works.jsx             # Process explanation
│   ├── medical-lamp-hero.jsx        # Hero section
│   ├── pricing.jsx                  # Subscription pricing
│   └── testimonials.jsx             # Patient reviews
├── 📁 actions/                      # Server actions
├── 📁 lib/                          # Utilities and configurations
├── 📁 prisma/                       # Database schema and migrations
├── 📁 public/                       # Static assets
└── 📁 hooks/                        # Custom React hooks
```

## 🚦 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon DB recommended)
- Clerk account for authentication

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/piyush-eon/doctors-appointment-platform.git
   cd doctors-appointment-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"
   DIRECT_URL="postgresql://username:password@host:port/database?sslmode=require"

   # Authentication (Clerk)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Optional: File Upload
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

5. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 👥 User Roles & Features

### **🩺 Patients**
- Smart health profile creation
- AI-powered doctor recommendations
- Appointment booking and management
- Comprehensive medical history tracking
- Secure video consultations
- Prescription and lab result access

### **👨‍⚕️ Doctors**
- Professional profile management
- Appointment scheduling and management
- Patient consultation tools
- Medical documentation system
- Earnings and payout tracking
- Verification and credentialing

### **👑 Administrators**
- Platform oversight and management
- Doctor verification and approval
- Payout processing and management
- System analytics and reporting
- User support and moderation

## 🎯 Key Pages & Functionality

### **🏠 Landing Page**
- Medical lamp hero section with animated effects
- Revolutionary "How It Works" process explanation
- Interactive testimonials from real users
- Flexible pricing with credit-based system
- Professional footer with newsletter signup

### **🔐 Authentication**
- Clerk-powered sign-in/sign-up
- Role-based onboarding flow
- Social login integrations
- Secure session management

### **📊 Dashboards**
- **Patient Dashboard**: Health overview, appointments, medical history
- **Doctor Dashboard**: Schedule management, patient consultations, earnings
- **Admin Dashboard**: Platform metrics, user management, verification queue

### **💼 Core Features**
- **Medical History**: Comprehensive health record management
- **Video Consultations**: HIPAA-compliant telemedicine
- **Smart Scheduling**: AI-optimized appointment booking
- **Credit System**: Flexible pay-per-consultation model

## 🔧 Development

### **Database Schema**
```prisma
// Key models
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  role        Role     @default(PATIENT)
  profile     Profile?
  appointments Appointment[]
  // ... additional fields
}

model Doctor {
  id           String   @id @default(cuid())
  specialty    String
  verified     Boolean  @default(false)
  availability Availability[]
  // ... additional fields
}

model Appointment {
  id        String   @id @default(cuid())
  status    Status   @default(PENDING)
  dateTime  DateTime
  // ... additional fields
}
```

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## 🎨 UI Components

### **Custom Components**
- **MedicalLampHero**: Aceternity lamp effect with medical branding
- **DoctorsSidebar**: Role-based navigation with user context
- **PatientTestimonials**: Infinite scroll testimonial carousel
- **HowItWorks**: Interactive process explanation cards
- **InteractiveFooter**: Newsletter signup and social media links

### **Theme Configuration**
```javascript
// Tailwind config with custom medical theme
module.exports = {
  theme: {
    extend: {
      colors: {
        purple: { /* Medical primary */ },
        orange: { /* Medical accent */ },
        emerald: { /* Medical success */ }
      }
    }
  }
}
```

## 🔐 Security & Compliance

- **HIPAA Compliance**: End-to-end encryption for all medical data
- **SOC 2 Type II**: Enterprise-grade security standards
- **Data Privacy**: Comprehensive privacy controls and data management
- **Secure Authentication**: Clerk-powered authentication with MFA support
- **Encrypted Communications**: All video calls and data transmission encrypted

## 📈 Performance

- **Next.js 15**: Latest performance optimizations with Turbopack
- **Image Optimization**: Automatic image compression and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Caching Strategy**: Intelligent caching for optimal performance
- **Mobile Responsive**: Fully responsive design across all devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Aceternity UI** for beautiful interactive components
- **Shadcn/ui** for the foundational component system
- **Clerk** for seamless authentication
- **Neon** for serverless PostgreSQL
- **Framer Motion** for smooth animations

## 📞 Support

For support and questions:
- 📧 Email: support@medimeet.com
- 💬 Discord: [Join our community](https://discord.gg/medimeet)
- 📚 Documentation: [docs.medimeet.com](https://docs.medimeet.com)

---

**Made with ❤️ for the future of healthcare**

![Footer](./public/logo.png)ll Stack Doctors Appointment Platform with Next JS, Neon, Tailwind, Vonage, Shadcn UI Tutorial 🔥🔥
## https://www.youtube.com/watch?v=ID1PRFF1dlw

<img width="1470" alt="Screenshot 2025-05-27 at 1 18 06 PM" src="https://github.com/user-attachments/assets/a0d3d443-f5e1-433a-85a7-a76a3866858d" />
