export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Under Review
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for submitting your business profile. Our team is
              currently reviewing your application. This process typically takes
              1-2 business days.
            </p>
            <div className="animate-pulse flex justify-center mb-6">
              <div className="h-12 w-12 rounded-full bg-orange-200"></div>
            </div>
            <p className="text-sm text-gray-500">
              You'll receive an email notification once your application has
              been reviewed. In the meantime, if you have any questions, please
              contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
