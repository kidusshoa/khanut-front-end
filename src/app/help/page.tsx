import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Help Center</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Manual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
            <p className="text-muted-foreground">
              Welcome to Khanut! This guide will help you get started with our platform.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">For Customers</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Search for businesses using the search bar</li>
              <li>View business profiles and services</li>
              <li>Book appointments or purchase products</li>
              <li>Track your orders in your dashboard</li>
              <li>Leave reviews for businesses you've interacted with</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">For Business Owners</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Register your business on our platform</li>
              <li>Set up your business profile and services</li>
              <li>Manage appointments and orders</li>
              <li>View analytics and customer feedback</li>
              <li>Update your business information as needed</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Need More Help?</h3>
            <p className="text-muted-foreground">
              If you need further assistance, please don't hesitate to 
              <Link href="/contact" className="text-primary hover:underline ml-1">
                contact our support team
              </Link>.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-muted/50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">How do I reset my password?</h3>
            <p className="text-muted-foreground">
              You can reset your password by clicking on the "Forgot Password" link on the login page.
            </p>
          </div>
          <div>
            <h3 className="font-medium">How do I update my business information?</h3>
            <p className="text-muted-foreground">
              Go to your business dashboard and click on "Edit Profile" to update your business information.
            </p>
          </div>
          <div>
            <h3 className="font-medium">What payment methods do you accept?</h3>
            <p className="text-muted-foreground">
              We accept various payment methods including credit/debit cards and mobile money through our secure payment gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
