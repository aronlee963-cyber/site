import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Loader2, Shield, Users, Star } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/dashboard" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username && loginData.password) {
      loginMutation.mutate(loginData);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.username && registerData.password) {
      registerMutation.mutate(registerData);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left side - Forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">PlayDirty</h1>
            <p className="text-gray-400">Your gaming enhancement platform</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50">
              <TabsTrigger value="login" className="text-gray-300 data-[state=active]:bg-[#1800ad] data-[state=active]:text-white">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="text-gray-300 data-[state=active]:bg-[#1800ad] data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Welcome back</CardTitle>
                  <CardDescription className="text-gray-400">
                    Sign in to access your gaming tools and orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username" className="text-gray-300">Username</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#1800ad]"
                        disabled={loginMutation.isPending}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Enter your password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#1800ad]"
                        disabled={loginMutation.isPending}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#1800ad] hover:bg-[#1800ad]/80 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Create account</CardTitle>
                  <CardDescription className="text-gray-400">
                    Join PlayDirty to access premium gaming enhancements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username" className="text-gray-300">Username</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Choose a username"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#1800ad]"
                        disabled={registerMutation.isPending}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Create a password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#1800ad]"
                        disabled={registerMutation.isPending}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#1800ad] hover:bg-[#1800ad]/80 text-white"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-gradient-to-br from-[#1800ad]/20 to-black flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1800ad]/20 rounded-full mb-4">
              <Shield className="h-8 w-8 text-[#1800ad]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Premium Gaming Tools</h2>
            <p className="text-gray-400 leading-relaxed">
              Access our exclusive collection of gaming enhancement tools with 24/7 support and instant delivery.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#1800ad]/10 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#1800ad]" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Trusted by Thousands</p>
                <p className="text-xs text-gray-400">Join our community of satisfied gamers</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#1800ad]/10 rounded-full flex items-center justify-center">
                  <Star className="h-5 w-5 text-[#1800ad]" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">Premium Quality</p>
                <p className="text-xs text-gray-400">High-performance tools with regular updates</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#1800ad]/10 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-[#1800ad]" />
                </div>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-white">24/7 Support</p>
                <p className="text-xs text-gray-400">Always here to help when you need us</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}