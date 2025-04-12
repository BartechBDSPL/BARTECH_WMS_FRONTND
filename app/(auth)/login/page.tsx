"use client"
import React, { FormEvent , useRef , useState } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { BACKEND_URL } from '@/lib/constants';
import { jwtDecode } from 'jwt-decode';

import GerrImage from '/public/images/bartechpicaaiTwo.png'; // Adjust path if needed
import BartechImage from '/public/images/bartech.png'; // Adjust path if needed

const Page = () => {
  const router = useRouter();
  const { toast } = useToast();
  const userIdRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  // Use state to manage form inputs
  const [userId, setUserId] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const getUserID = () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        return decodedToken.user.User_ID;
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
    return '';
  };

 
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Input validation
    if (!userId) {
        userIdRef.current?.focus();
        return;
    }
    if (!password) {
        passwordRef.current?.focus();
        return;
    }

    // // Hardcoded admin check
    // if (userId === 'admin' && password === 'admin') {
    //     Cookies.set('login', 'true', { expires: 1 });
    //     router.push('/dashboard');
    //     toast({
    //         title: "Logged in ✅",
    //         description: "Logged in successfully as admin",
    //     });
    //     return;
    // }

    try {
        // Check if user exists first (optional step)
        const userCheck = await fetch(`${BACKEND_URL}/api/auth/user-exist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                User_ID: userId.trim()
            })
        });

        const userData = await userCheck.json();
        if (!userData[0]?.UserExists) {
            toast({
                variant: "destructive",
                title: "Error ❌",
                description: "User does not exist",
            });
            return;
        }

        // Main login request
        const response = await fetch(`${BACKEND_URL}/api/auth/check-credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                User_ID: userId.trim(),
                User_Password: password,
                ApplicationType: 'WEB'
            }),
        });

        const data = await response.json();

        if (response.ok) {
            const decodedToken: any = jwtDecode(data.token);
            
            if (decodedToken?.user?.User_ID) {
                Cookies.set('login', 'true', { expires: 1 });
                Cookies.set('token', data.token, { expires: 1 });
                router.push('/dashboard');
                toast({
                    title: "Logged in ✅",
                    description: "Logged in successfully",
                });
            } else {
                throw new Error('Invalid token structure');
            }
        } else {
            throw new Error(data.message || 'Login failed');
        }

    } catch (error) {
        console.error('Login Error:', error);
        toast({
            variant: "destructive",
            title: "Error ❌",
            description: error instanceof Error ? error.message : "An unexpected error occurred",
        });
    }
};

  return (
    <section>
    <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
      <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
        {/* <Image
          alt=""
          src="/images/gerr.png"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
          fill
        /> */}
        <Image
  alt=""
  src={GerrImage}
  className="absolute inset-0 h-full w-full object-cover opacity-80"
  fill
/>

        <div className="hidden lg:relative lg:block lg:p-12">
          <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl md:text-3xl">
            Warehouse Management System (WMS)
          </h2>

          <p className="mt-4 leading-relaxed text-white">
            Login page
          </p>
        </div>
      </section>

      <main className="flex items-center justify-center flex-col px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
        <div className="max-w-xl lg:max-w-3xl w-full">
          <div className="relative -mt-16 block lg:hidden text-center">
            <UserCircle className="mx-auto h-12 w-12 text-blue-400" />
            <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
              Warehouse Management System (WMS)
            </h1>
          </div>

          <Card className="w-full max-w-md mx-auto mt-5">
            <CardHeader className="text-center">
              <UserCircle className="mx-auto h-12 w-12 text-blue-400 hidden sm:block" />
              <CardTitle className="mt-4 text-2xl font-bold">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    User Id
                  </label>
                  <Input
                    type="text"
                    id="userId"
                    name="userId"
                    placeholder="Enter your user id"
                    className="mt-1 w-full"
                    ref={userIdRef}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-muted-foreground"
                  >
                    Password
                  </label>
                  <Input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    className="mt-1 w-full"
                    ref={passwordRef}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Log in
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary underline">
                  Register
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
        <Link target='blank' href={'https://bartechdata.net/'}>
          <div className="mt-4 flex flex-col space-y-3">
            <p className="text-gray-500">Built and maintained by</p>
            {/* <Image 
              src="/images/bartech.png" 
              alt="bartech-logo" 
              width={100}
              height={25}
              className="mx-auto inline-block" 
            /> */}
            <Image 
  src={BartechImage}
  alt="bartech-logo" 
  width={100}
  height={25}
  className="mx-auto inline-block" 
/>

          </div>
        </Link>
      </main>
    </div>
  </section>
  );
};



export default Page;

