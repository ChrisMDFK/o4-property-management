# Community Manager Dashboard

A comprehensive property management system built for community managers to handle residents, points system, facility usage, and announcements.

## Features

- **Resident Management**: Add, edit, and manage community residents with search functionality
- **Points Ledger**: Track and adjust resident points with detailed transaction history
- **Facility Registration**: Record facility usage with automatic point deduction
- **Announcement Management**: Create and manage community announcements
- **Real-time KPIs**: Dashboard cards showing key metrics and daily summaries
- **Traditional Chinese UI**: Complete interface in Traditional Chinese

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase
- **Authentication**: JWT-based with company isolation

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd community-manager-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser.

### Demo Login

For testing purposes, use these credentials:
- Company Code: `demo-company`
- JWT: `demo-jwt-token`

## Database Schema

The application expects the following Supabase tables:

### residents
- `id` (uuid, primary key)
- `name` (text)
- `address` (text)
- `phone` (text)
- `email` (text, nullable)
- `notes` (text, nullable)
- `company_id` (text)
- `created_at` (timestamp)

### point_ledger
- `id` (uuid, primary key)
- `resident_id` (uuid, foreign key)
- `item_name` (text)
- `points` (integer)
- `notes` (text, nullable)
- `company_id` (text)
- `created_at` (timestamp)

### announcements
- `id` (uuid, primary key)
- `title` (text)
- `content` (text)
- `is_published` (boolean)
- `company_id` (text)
- `created_at` (timestamp)

### Required RPC Functions
- `get_resident_balance(resident_id uuid)` - Returns current point balance
- `get_today_point_summary(company_id text)` - Returns daily point summary

## Features Overview

### Dashboard
- KPI cards showing total residents, daily deductions, registrations, and announcements
- Tabbed interface for different management sections

### Resident Management
- CRUD operations for residents
- Search by name or address
- Point balance display
- Contact information management

### Points Ledger
- Transaction history with filtering
- Manual point adjustments
- Daily summaries (deductions/additions)
- Detailed transaction notes

### Facility Registration
- Pre-configured facility point costs
- Automatic point deduction
- Daily usage tracking
- Real-time registration log

### Announcement System
- Create and edit announcements
- Draft/published status management
- Content preview functionality
- Publication timestamp tracking

## Deployment

The application is configured for deployment on Vercel:

```bash
npm run build
```

Ensure your environment variables are properly configured in your deployment platform.

## Security

- Row Level Security (RLS) enforced on all tables
- Company-based data isolation
- JWT authentication with role-based access
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.