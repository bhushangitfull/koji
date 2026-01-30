# Backend Setup Instructions

Since we're having PowerShell issues, follow these steps manually:

## Step 1: Create Backend Directory
```bash
cd koji
mkdir backend
cd backend
```

## Step 2: Initialize Node Project
```bash
npm init -y
```

## Step 3: Install Dependencies
```bash
npm install express pg dotenv cors helmet uuid bcryptjs jsonwebtoken redis bull express-validator
npm install -D typescript ts-node @types/express @types/node @types/uuid @types/bcryptjs @types/jsonwebtoken eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser jest @types/jest ts-jest
```

## Step 4: Create TypeScript Config
Create `tsconfig.json` in backend folder with the provided template

## Step 5: Create Project Structure
```
backend/
├── src/
│   ├── index.ts
│   ├── database/
│   │   └── schema.sql
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── env.ts
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── episodes.ts
│   │   ├── vocabulary.ts
│   │   ├── quiz.ts
│   │   ├── progress.ts
│   │   ├── leaderboard.ts
│   │   └── friends.ts
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── utils/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Step 6: Update package.json scripts
Replace with the provided package.json content
