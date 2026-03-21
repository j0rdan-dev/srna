import { Droplets, Rocket, FlaskConical, LucideIcon } from "lucide-react";

export interface Category {
  id: string;
  label: string;
  description: string;
  file: string;
  icon: LucideIcon;
  color: string;
}

export const categories: Category[] = [
  {
    id: "voda",
    label: "Вода и материја",
    description: "Агрегатни состојби, испарување, кружење на водата",
    file: "/data/sample.json",
    icon: Droplets,
    color: "196 80% 50%",
  },
  {
    id: "vselena",
    label: "Вселена",
    description: "Планети, ѕвезди, Сончев систем",
    file: "/data/вселена.json",
    icon: Rocket,
    color: "262 60% 55%",
  },
  {
    id: "nauka",
    label: "Наука",
    description: "Биологија, хемија, физика, човечко тело",
    file: "/data/наука.json",
    icon: FlaskConical,
    color: "24 80% 55%",
  },
];
