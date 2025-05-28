
interface AddOn {
    id: number;
    checked: boolean;
    title: string;
    subtitle: string;
    price: number;
  }

export type FormItems = {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    province: string;
    district: string;
    hospital: string;
  };