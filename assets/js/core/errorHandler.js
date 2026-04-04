export const handleSupabaseError = (error) => {
  if (!error) return "حدث خطأ غير متوقع.";

  const code = error.code || error.status;
  const message = error.message || "";

  const postgresErrors = {
    "23505": "هذه البيانات (  الايميل او مثل رقم الهاتف) موجودة بالفعل! يرجى إدخال قيم فريدة.",
    "23503": "لا يمكن حذف أو تعديل هذا السجل لأنه مرتبط ببيانات أخرى في النظام.",
    "23502": "يرجى ملء جميع الخانات الإجبارية المطلوبة.",
    "42P17": "خطأ في صلاحيات الوصول (RLS)! تم اكتشاف دورة برمجية لا نهائية.",
    "42P01": "الجدول المطلوب غير موجود في النظام.",
    "42703": "العمود المطلوب غير موجود، يرجى تحديث الصفحة.",
    "22P02": "تنسيق البيانات المدخلة غير صحيح (مثلاً إدخال نص بدلاً من رقم).",
    "PGRST204": "العمود المطلوب غير موجود في قاعدة البيانات حالياً.",
    "PGRST116": "لم يتم العثور على أي نتائج مطابقة لهذا البحث.",
  };

  const authErrors = {
    "invalid_credentials": "بيانات تسجيل الدخول غير صحيحة (الإيميل أو كلمة المرور).",
    "email_not_confirmed": "يرجى تأكيد حسابك من خلال البريد الإلكتروني أولاً.",
    "user_not_found": "هذا المستخدم غير مسجل في النظام.",
    "too_many_requests": "محاولات كثيرة جداً! يرجى المحاولة مرة أخرى بعد قليل.",
    "network_error": "فشل الاتصال بالخادم، يرجى التأكد من الإنترنت."
  };

  if (postgresErrors[code]) return postgresErrors[code];
  
  if (message.includes("Invalid login credentials") || code === "invalid_credentials") {
      return authErrors["invalid_credentials"];
  }
  
  if (message.includes("Email not confirmed")) return authErrors["email_not_confirmed"];
  if (message.includes("too many requests")) return authErrors["too_many_requests"];

  if (error.details && error.details.includes("already exists")) {
      return "هذه البيانات مسجلة مسبقاً، يرجى المحاولة ببيانات مختلفة.";
  }

  return "حدث خطأ أثناء العملية، يرجى المحاولة مرة أخرى.";
};
