"use client";

import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, schema } from "@/lib/schema";
import { apiClient } from "@/lib/api-client";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    try {
      await apiClient.register(data);
      toast.success("Account created! Please enter your password to confirm.");
    
      router.push(`/auth/login?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      toast.error(
        error.message || error.details || "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center items-center p-8 sm:p-8 relative">
        <div className="absolute sm:top-8 sm:left-8 hidden sm:block">
          <svg
            width="32"
            height="32"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#15803d" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
            </defs>
            <polygon points="50,10 90,90 10,90" fill="url(#gradient)" />
          </svg>
        </div>
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
            <p className="text-muted-foreground">
              Enter your details to create a new account
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div>
              <div className="grid gap-2">
                <Label htmlFor="name" className=" text-sm">
                  Full Name
                </Label>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  {...register("name")}
                  className="border-[1.5px] px-2 py-1 rounded-md border-gray-500 focus:ring-1 text-base"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <div className="grid gap-2">
                <Label htmlFor="email" className=" text-sm">
                  Email
                </Label>
                <input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className="border-[1.5px] px-2 py-1 rounded-md border-gray-500 focus:ring-1 text-base"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="grid gap-2 w-full">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="border-[1.5px] px-2 py-1 rounded-md border-gray-500 focus:ring-1 text-base"
                />
              </div>
              <div className="grid gap-2 w-full">
                <Label htmlFor="confirmPassword" className="text-sm">
                  Confirm Password
                </Label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  className="border-[1.5px] px-2 py-1 rounded-md border-gray-500 focus:ring-1 text-base"
                />
              </div>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#022c22] text-white disabled:opacity-50"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
          <div className="flex flex-col gap-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="bg-gray-50 flex items-center hover:bg-gray-100"
              >
                <Image src="/google.svg" alt="google" width={20} height={20} />
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-gray-50 flex items-center hover:bg-gray-100"
              >
                <Image src="/apple.svg" alt="apple" width={20} height={20} />
                Apple
              </Button>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-[#15803d] hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="relative hidden md:block">
        <Image
          src="/drill.png"
          alt="Drill"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
