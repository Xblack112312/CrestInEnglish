"use client";
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password is required & must be at least 8 characters.",
  }),
});

const page = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const { email, password } = values;

      if (!email || !password) {
        toast.error("Missing Required Fields.");
        return;
      }

      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!response) {
        toast.error("Authentication failed. Please try again.");
        return;
      }

      if (response.error) {
        setLoading(false)
        // Custom error messages from authorize()
        switch (response.error) {
          case "CredentialsSignin":
            toast.error("Invalid email or password.");
            break;
          case "NO_PASSWORD_SET":
            toast.error("This account does not have a password set.");
            break;
          default:
            toast.error(response.error);
        }
        return;
      }

      if (response.ok) {
        setLoading(false);
        router.replace("/");
      }
    } catch (error) {
      console.log(error);
      toast.error(error as string);
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center text-cener">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-full max-w-md bg-white p-6"
        >
          <h2 className="text-3xl font-bold">Sign In</h2>
          <p className="text-sm text-black/40">
            Log In to access your courses & to see access your account
          </p>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    placeholder="Email."
                    className="w-full border border-black/20 rounded-md px-3 py-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    type="password"
                    placeholder="Password."
                    className="w-full border border-black/20 rounded-md px-3 py-2"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full cursor-pointer bg-black text-white py-2"
          >
            {loading ? "Loging In..." : "Log In."}
          </Button>
            <div className="flex items-center flex-row justify-between">
          <p className="text-xs text-black/60">
            Don't Have an Account{" "}
            <Link href="/sign-up" className="underline text-black">
              Sign Up
            </Link>
          </p>

          <Link href="/forget-password" className="underline text-sm text-black">
              Forget Password.
            </Link>
            </div>
        </form>
      </Form>
    </div>
  );
};

export default page;
