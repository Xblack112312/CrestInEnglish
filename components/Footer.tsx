import React from "react";

const Footer = () => {
  return (
    <footer className="px-12 py-16 border-t border-zinc-200">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div>
          <h3 className="text-lg font-medium">CrestInEnglish</h3>
          <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
            A complete English learning platform for Azhar and General Education
            students in Egypt.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-medium mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="hover:text-black cursor-pointer">About Us</li>
            <li className="hover:text-black cursor-pointer">Courses</li>
            <li className="hover:text-black cursor-pointer">Teachers</li>
            <li className="hover:text-black cursor-pointer">Reviews</li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4 className="text-sm font-medium mb-3">Support</h4>
          <ul className="space-y-2 text-sm text-zinc-600">
            <li className="hover:text-black cursor-pointer">FAQ</li>
            <li className="hover:text-black cursor-pointer">Contact Us</li>
            <li className="hover:text-black cursor-pointer">Privacy Policy</li>
            <li className="hover:text-black cursor-pointer">Terms of Service</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} English Platform. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
