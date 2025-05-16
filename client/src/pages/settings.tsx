import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { Bell, Lock, Globe, UserCircle, CreditCard } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: "+1 (555) 123-4567",
  });

  const [notifications, setNotifications] = useState({
    tripReminders: true,
    priceAlerts: true,
    destinationUpdates: false,
    marketingEmails: false,
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getRoleColor = () => {
    if (!user?.role) return "bg-gray-200";
    
    switch (user.role) {
      case "tourist":
        return "bg-emerald-100 text-emerald-800";
      case "nomad":
        return "bg-blue-100 text-blue-800";
      case "business":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <UserCircle size={16} />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell size={16} />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock size={16} />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Globe size={16} />
            <span>Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard size={16} />
            <span>Billing</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and how others see you.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 relative">
                  <img 
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80&q=80"} 
                    alt="Profile" 
                    className="h-full w-full rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white ${getRoleColor()}`}></div>
                </div>
                <div>
                  <h3 className="font-medium">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${getRoleColor()}`}>
                    {user?.role === 'tourist' ? 'Tourist' : 
                     user?.role === 'nomad' ? 'Digital Nomad' : 
                     user?.role === 'business' ? 'Business' : 'User'}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={profileData.firstName} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={profileData.lastName} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    value={profileData.email} 
                    onChange={handleProfileChange} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber"
                    value={profileData.phoneNumber} 
                    onChange={handleProfileChange} 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="mr-2">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Trip Reminders</h4>
                    <p className="text-sm text-muted-foreground">
                      Get reminders about upcoming trips, check-ins, and flights.
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.tripReminders} 
                    onCheckedChange={() => handleNotificationToggle('tripReminders')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Price Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications when prices drop for saved destinations.
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.priceAlerts}
                    onCheckedChange={() => handleNotificationToggle('priceAlerts')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Destination Updates</h4>
                    <p className="text-sm text-muted-foreground">
                      Stay informed about changes to travel requirements or local conditions.
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.destinationUpdates}
                    onCheckedChange={() => handleNotificationToggle('destinationUpdates')}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Marketing Emails</h4>
                    <p className="text-sm text-muted-foreground">
                      Get special offers, destination ideas, and travel inspiration.
                    </p>
                  </div>
                  <Switch 
                    checked={notifications.marketingEmails}
                    onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Change your password or reset it if you've forgotten it.
                </p>
                <Button variant="outline" className="mt-2">Change Password</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account.
                </p>
                <Button variant="outline" className="mt-2">Set Up 2FA</Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Session Management</h3>
                <p className="text-sm text-muted-foreground">
                  See where you're logged in and log out of other sessions.
                </p>
                <Button variant="outline" className="mt-2">Manage Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Travel Preferences</CardTitle>
              <CardDescription>
                Customize your travel experience based on your preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Currency</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred currency for prices.
                  </p>
                </div>
                <div className="w-[180px]">
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Distance Units</h4>
                  <p className="text-sm text-muted-foreground">
                    Set your preferred distance measurement.
                  </p>
                </div>
                <div className="w-[180px]">
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="km">Kilometers</option>
                    <option value="mi">Miles</option>
                  </select>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Language</h4>
                  <p className="text-sm text-muted-foreground">
                    Choose the language for the interface.
                  </p>
                </div>
                <div className="w-[180px]">
                  <select className="w-full rounded-md border border-input bg-background px-3 py-2">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Current Plan</h3>
                    <p className="font-bold text-2xl mt-1">Free Plan</p>
                    <p className="text-sm text-muted-foreground mt-1">Basic features for planning occasional trips</p>
                  </div>
                  <Button>Upgrade Plan</Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Available Plans</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Tourist</h4>
                    <p className="text-2xl font-bold mt-2">$9.99<span className="text-sm font-normal">/month</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Perfect for vacation travelers</p>
                    <Button variant="outline" className="w-full mt-4">Select</Button>
                  </div>
                  <div className="border rounded-lg p-4 border-primary">
                    <div className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded absolute -mt-6 ml-2">Popular</div>
                    <h4 className="font-medium">Digital Nomad</h4>
                    <p className="text-2xl font-bold mt-2">$19.99<span className="text-sm font-normal">/month</span></p>
                    <p className="text-sm text-muted-foreground mt-1">Ideal for remote workers</p>
                    <Button className="w-full mt-4">Select</Button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium">Business</h4>
                    <p className="text-2xl font-bold mt-2">$39.99<span className="text-sm font-normal">/month</span></p>
                    <p className="text-sm text-muted-foreground mt-1">For teams and business travel</p>
                    <Button variant="outline" className="w-full mt-4">Select</Button>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-4">Payment Methods</h3>
                <p className="text-sm text-muted-foreground">No payment methods added yet.</p>
                <Button variant="outline" className="mt-4">Add Payment Method</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}