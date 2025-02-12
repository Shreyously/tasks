'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name,
        }),
      });

      if (res.ok) {
        router.push('/auth/signin');
      } else {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('An error occurred during registration');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Sign up to get started with Task Management
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              name="name"
              placeholder="Name"
              required
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              required
              className="w-full"
            />
          </div>
          <div>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required
              className="w-full"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}