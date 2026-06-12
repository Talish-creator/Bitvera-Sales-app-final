import fs from 'fs';
import path from 'path';

const dict: Record<string, string> = {
  // Navigation
  "Bitvera Sales": "مبيعات بيتفيرا",
  "Dashboard": "لوحة القيادة",
  "Sales": "المبيعات",
  "Inventory": "المخزون",
  "CRM": "العملاء",
  "Reports": "التقارير",
  
  // Settings
  "Settings": "الإعدادات",
  "User Settings": "إعدادات المستخدم",
  "System Configuration": "تكوين النظام",
  "General Configuration": "التكوين العام",
  "Logout Application": "تسجيل الخروج من التطبيق",
  "Save Preferences": "حفظ التفضيلات",
  "Update Password": "تحديث كلمة المرور",
  "Change Credentials": "تغيير بيانات الاعتماد",
  "Old Password": "كلمة المرور القديمة",
  "New Password": "كلمة المرور الجديدة",
  "Active Currency": "العملة النشطة",
  "System Theme": "مظهر النظام",
  "Light Mode": "الوضع الفاتح",
  "Dark Mode": "الوضع الداكن",

  // Login
  "Login": "تسجيل الدخول",
  "Welcome Back": "مرحباً بعودتك",
  "Enter your credentials": "أدخل بيانات الاعتماد الخاصة بك",
  "Username": "اسم المستخدم",
  "Password": "كلمة المرور",
  "Authentication required": "مطلوب المصادقة",
  "Sign In": "دخول",
  "Role": "الدور",
  "Salesman": "مندوب مبيعات",
  "Manager": "مدير",

  // Dashboard
  "Welcome back,": "مرحباً بعودتك،",
  "Performance Engine": "محرك الأداء",
  "Today's Sales": "مبيعات اليوم",
  "Active Orders": "الطلبات النشطة",
  "Route Completion": "إنجاز المسار",
  "Stock Levels": "مستويات المخزون",
  "Quick Actions": "إجراءات سريعة",
  "Sync Database": "مزامنة قاعدة البيانات",
  "New Order": "طلب جديد",
  "Add Customer": "إضافة عميل",
  "Van Stock": "مخزون الشاحنة",
  "EOD Closing": "الإغلاق اليومي",
  "Recent Transactions": "المعاملات الأخيرة",
  "INV": "فاتورة",
  "SAR": "ر.س",

  // Create Order / POS
  "POS Details": "تفاصيل نقطة البيع",
  "Review Order": "مراجعة الطلب",
  "Confirm Items": "تأكيد العناصر",
  "Available Stock:": "المخزون المتوفر:",
  "Proceed to Payment": "الانتقال للدفع",
  "Continue": "متابعة",
  "Add Item": "إضافة عنصر",
  "Order Summary": "ملخص الطلب",
  "Subtotal": "المجموع الفرعي",
  "Tax": "الضريبة",
  "Total": "الإجمالي",

  // Payment
  "Process Payment": "معالجة الدفع",
  "Order Total": "إجمالي الطلب",
  "Payment Method": "طريقة الدفع",
  "Cash": "نقدي",
  "Bank Transfer": "تحويل بنكي",
  "Credit": "آجل",
  "Amount Received": "المبلغ المستلم",
  "Amount Remainder": "المبلغ المتبقي",
  "Confirm Payment": "تأكيد الدفع",
  "Payment Successful": "اكتمل الدفع بنجاح",
  "Invoice Generated": "تم إنشاء الفاتورة",
  
  // Invoice Viewer
  "Invoice Details": "تفاصيل الفاتورة",
  "Print Invoice": "طباعة الفاتورة",
  "Download PDF": "تحميل PDF",
  "Share": "مشاركة",
  "Close View": "إغلاق العرض",
  "Customer": "العميل",
  "Date": "التاريخ",

  // Inventory / Van Stock
  "Van Inventory": "مخزون الشاحنة",
  "Search inventory": "البحث في المخزون",
  "In Stock": "متوفر",
  "Low Stock": "مخزون منخفض",
  "Out of Stock": "غير متوفر",
  "Category": "الفئة",
  "Item ID:": "رقم العنصر:",
  "Stock Replenishment": "تجديد المخزون",
  
  // Customers / CRM
  "Customers": "العملاء",
  "Add New Customer": "إضافة عميل جديد",
  "Company Name": "اسم الشركة",
  "Contact Person": "الشخص المسؤول",
  "Phone Number": "رقم الهاتف",
  "Email Address": "البريد الإلكتروني",
  "Credit Limit": "الحد الائتماني",
  "VAT Number": "الرقم الضريبي",

  // Closing Reports
  "End of Day Report": "تقرير نهاية اليوم",
  "Collection Summary": "ملخص التحصيلات",
  "Total Cash": "إجمالي النقد",
  "Total Bank": "إجمالي البنك",
  "Total Credit": "إجمالي الآجل",
  "Submit EOD": "تقديم تقرير نهاية اليوم",
  "Print Report": "طباعة التقرير",

  // Analytics
  "Sales Analytics": "تحليلات المبيعات",
  "Current Target": "الهدف الحالي",
  "Profit Margin": "هامش الربح",
  "Total Sales": "إجمالي المبيعات",
  "View full stats": "عرض كافة الإحصائيات",
  "Daily Performance": "الأداء اليومي",
  "Target vs Actual": "المستهدف مقابل الفعلي"
};

try {
  fs.writeFileSync('src/translations.json', JSON.stringify(dict, null, 2));
  console.log("Translations written successfully.");
} catch(e) {
  console.error(e);
}
