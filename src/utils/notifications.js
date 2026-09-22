import Swal from "sweetalert2";

export const showSuccessToast = (title) => {
  Swal.fire({
    toast: true,
    position: "top-end",
    title,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};
