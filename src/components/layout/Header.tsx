
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut, Settings, ChevronDown } from "lucide-react";

export function Header() {
  const { user, profile, signOut, isAdmin } = useAuth();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-ndt-700">NDT Hours Verified</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-ndt-600">
                  Dashboard
                </Link>
                <Link to="/ndt-hours" className="text-gray-700 hover:text-ndt-600">
                  NDT Hours
                </Link>
                <Link to="/rope-hours" className="text-gray-700 hover:text-ndt-600">
                  Rope Access
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-700 hover:text-ndt-600">
                    Admin
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/" className="text-gray-700 hover:text-ndt-600">
                  Home
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-ndt-600">
                  About
                </Link>
              </>
            )}
          </nav>
          
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 flex items-center gap-2 text-base">
                    <UserCircle className="h-5 w-5" />
                    <span className="hidden sm:inline-block">
                      {profile?.username || user.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-4">
                <Button variant="ghost" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button className="bg-ndt-600 hover:bg-ndt-700" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
