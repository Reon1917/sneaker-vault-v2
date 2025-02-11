# Sneaker Vault v2 🚀

A modern web application for sneaker enthusiasts to search, save, and organize their sneaker collections. Built with Next.js 13+, Supabase, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-13+-black)
![Supabase](https://img.shields.io/badge/Supabase-Latest-green)
![Tailwind](https://img.shields.io/badge/Tailwind-3-blue)
![DaisyUI](https://img.shields.io/badge/DaisyUI-4-purple)

## ✨ Features

- 🔍 **Advanced Sneaker Search**: Search across multiple sneaker marketplaces
- 🗄️ **Personal Vault**: Save and manage your favorite sneakers
- 📁 **Collections**: Organize sneakers into custom collections
- 🌓 **Dark Mode**: Sleek dark theme with jet black design
- 🔐 **Authentication**: Secure login with Google and GitHub
- 📱 **Responsive Design**: Optimized for all devices
- 🎯 **Real-time Updates**: Instant feedback for all actions
- 🛡️ **Data Security**: Row-level security with Supabase

## 🛠️ Tech Stack

- **Frontend**: Next.js 13+ (App Router)
- **Styling**: Tailwind CSS + DaisyUI
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: Sneaks-API Integration
- **State Management**: React Hooks
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- pnpm (recommended) or npm
- Supabase Account
- Google OAuth Credentials
- GitHub OAuth Credentials

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sneaker-vault-v2.git
cd sneaker-vault-v2
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update .env.local with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Run the development server:
```bash
pnpm dev
```

Visit http://localhost:3000 to see your app.

## 📦 Project Structure

```
sneaker-vault-v2/
├── app/                  # Next.js 13+ App Router
│   ├── api/             # API routes
│   ├── auth/            # Authentication pages
│   ├── components/      # Reusable components
│   ├── lib/            # Utility functions
│   └── ...             # Other app routes
├── docs/               # Documentation
├── public/            # Static assets
└── ...                # Config files
```

## 🔒 Authentication Setup

1. Configure Supabase Authentication:
   - Set up OAuth providers (Google, GitHub)
   - Configure redirect URLs
   - Set up row-level security policies

2. Update Google Cloud Console:
   - Add authorized redirect URIs
   - Configure OAuth consent screen
   - Set up proper credentials

## 🎨 Features in Detail

### Sneaker Search
- Real-time search across multiple sources
- Advanced filtering options
- Detailed sneaker information

### Personal Vault
- Save favorite sneakers
- Quick access to saved items
- Organize collections

### Collections
- Create custom collections
- Add/remove sneakers
- Manage collection details

### User Interface
- Responsive design
- Dark mode support
- Toast notifications
- Loading states
- Error handling

## 🔧 Configuration

### Supabase Setup
- Database schema available in docs/
- RLS policies for security
- Authentication configuration

### Environment Variables
Required variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 📱 Responsive Design

- Mobile-first approach
- Tablet optimization
- Desktop enhancements
- Consistent experience across devices

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend infrastructure
- Tailwind CSS for the styling system
- DaisyUI for the component library
- Sneaks-API for sneaker data

## 📞 Contact

Your Name - [Lin Myat Phyo](https://www.linkedin.com/in/lin-myat-phyo-b872b1217/)

Project Link: [https://github.com/yourusername/sneaker-vault-v2](https://github.com/yourusername/sneaker-vault-v2)

---
Built with ❤️ by Lin Myat Phyo
