import React from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const page = () => {
  return (
    <section>
      <div className="lg:grid lg:min-h-screen lg:grid-cols-12">
        <section className="relative flex h-32 items-end bg-gray-900 lg:col-span-5 lg:h-full xl:col-span-6">
          <Image
            alt="WMS"
            src="/images/WMS2.jpg"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
            fill
          />

          <div className="hidden lg:relative lg:block lg:p-12">
            <a className="block text-white" href="#">
              <span className="sr-only">Home</span>
              <svg
                className="h-8 sm:h-10"
                viewBox="0 0 28 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              />
            </a>

            <h2 className="mt-6 text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Warehouse Management System (WMS) 
            </h2>

            <p className="mt-4 leading-relaxed text-white">
             Registration page
            </p>
          </div>
        </section>

        <main className="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6">
          <div className="max-w-xl lg:max-w-3xl w-full">
            <div className="relative -mt-16 block lg:hidden text-center">
              <a
                className="inline-flex items-center justify-center rounded-full bg-white text-blue-600"
                href="#"
              >
                <span className="sr-only">Home</span>
                <UserCircle className="mx-auto h-12 w-12 text-blue-400" />
              </a>

              <h1 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl">
                 Warehouse Management System (WMS) 
              </h1>

              <p className="mt-4 leading-relaxed text-gray-500">
                 Registration page
              </p>
            </div>

            <form action="#" className="mt-8 grid grid-cols-6 gap-6">
              <Card className="col-span-6">
                <CardHeader className="text-center p-6 rounded-t-lg">
                  <UserCircle className="mx-auto h-12 w-12 text-blue-400 hidden lg:block" />
                  <CardTitle className="mt-4 text-2xl font-bold">Register</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="FirstName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <Input
                        type="text"
                        id="FirstName"
                        name="first_name"
                        className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="LastName"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <Input
                        type="text"
                        id="LastName"
                        name="last_name"
                        className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label
                        htmlFor="Email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email
                      </label>
                      <Input
                        type="email"
                        id="Email"
                        name="email"
                        className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="Password"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password
                      </label>
                      <Input
                        type="password"
                        id="Password"
                        name="password"
                        className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label
                        htmlFor="PasswordConfirmation"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password Confirmation
                      </label>
                      <Input
                        type="password"
                        id="PasswordConfirmation"
                        name="password_confirmation"
                        className="mt-1 w-full rounded-md border-gray-200 bg-white text-sm text-gray-700 shadow-sm"
                      />
                    </div>

                    <div className="col-span-6">
                      <label htmlFor="MarketingAccept" className="flex gap-4">
                        <Checkbox
                          id="MarketingAccept"
                          name="marketing_accept"
                          className="size-5 rounded-md border-gray-200 bg-white shadow-sm"
                        />
                        <span className="text-sm text-gray-700">
                          Agree to terms and condition
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="col-span-6 sm:flex sm:items-center sm:gap-4 mt-6">
                    <Button className="inline-block w-full sm:w-auto bg-blue-600 text-white font-medium rounded-md px-4 py-2 transition hover:bg-blue-700 focus:outline-none focus:ring">
                      Create an account
                    </Button>

                    <p className="mt-4 text-sm text-gray-500 sm:mt-0">
                      Already have an account?{' '}
                      <Link href="/login" className="text-gray-700 underline">
                        Log in
                      </Link>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>
        </main>
      </div>
    </section>
  );
};

export default page;
