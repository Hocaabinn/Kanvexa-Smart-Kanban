import Swal from "sweetalert2";

export const swalAlert = Swal.mixin({
  customClass: {
    confirmButton: "px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold border-none outline-none cursor-pointer shadow-md transition mx-1",
    cancelButton: "px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold border-none outline-none cursor-pointer transition mx-1",
    popup: "rounded-2xl border border-slate-200 shadow-xl font-sans p-6",
    title: "text-lg font-extrabold text-slate-900",
    htmlContainer: "text-sm text-slate-500 font-medium"
  },
  buttonsStyling: false
});

export const showAlert = (title: string, text: string, icon: "success" | "error" | "warning" | "info" = "info") => {
  return swalAlert.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK"
  });
};

export const showConfirm = (title: string, text: string, confirmText: string = "Ya", cancelText: string = "Batal") => {
  return swalAlert.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
};
