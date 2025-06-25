export const categories = [
  {
    id: 1,
    name: "الدهان والديكور",
    icon: "🎨",
    subcategories: [
      {
        id: 11,
        name: "خدمة الدهان",
        services: [
          {
            id: 1,
            name: "دهان الجدران الداخلية",
            description: "دهان الجدران الداخلية مع التحضير",
            price_unit: 25,
            currency: "SAR",
            foreign_key_generator: 1,
            product_ids: [1, 2],
          },
          {
            id: 2,
            name: "تركيب ورق جدران",
            description: "تركيب ورق جدران مع التحضير",
            price_unit: 30,
            currency: "SAR",
            foreign_key_generator: 2,
            product_ids: [3],
          },
          {
            id: 3,
            name: "دهان الأسقف",
            description: "دهان الأسقف مع التحضير",
            price_unit: 35,
            currency: "SAR",
            foreign_key_generator: 3,
            product_ids: [1, 2],
          },
        ],
      },
    ],
  },
];

export const type_de_generator = [
  {
    id: 1,
    name: "حاسبة الدهان",
    inputs: [
      {
        name: "area",
        label: "المساحة",
        type: "number",
        unit: "m²",
      },
      {
        name: "paint_type",
        label: "نوع الدهان",
        type: "select",
        options: ["مائي", "زيتي"],
      },
    ],
    pricing_formula:
      "(area * price_unit) + (Math.ceil(area / (paint_type === 'زيتي' ? 20 : 25)) * (paint_type === 'زيتي' ? 75 : 60))",
  },
  {
    id: 2,
    name: "حاسبة ورق الجدران",
    inputs: [
      {
        name: "wall_length",
        label: "طول الجدار",
        type: "number",
        unit: "m",
      },
      {
        name: "wall_height",
        label: "ارتفاع الجدار",
        type: "number",
        unit: "m",
      },
    ],
    pricing_formula:
      "(wall_length * wall_height * price_unit) + (Math.ceil((wall_length * wall_height) / 3) * 45)",
  },
  {
    id: 3,
    name: "حاسبة دهان الأسقف",
    inputs: [
      {
        name: "room_area",
        label: "مساحة الغرفة",
        type: "number",
        unit: "m²",
      },
      {
        name: "design_complexity",
        label: "تعقيد التصميم",
        type: "select",
        options: ["بسيط", "متوسط", "معقد"],
      },
    ],
    pricing_formula:
      "room_area * price_unit * (design_complexity === 'بسيط' ? 1.0 : design_complexity === 'متوسط' ? 1.5 : 2.0)",
  },
];

export const products = [
  {
    id: 1,
    name: "دهان جوتن مميز",
    description: "دهان داخلي عالي الجودة",
    price: 120,
    currency: "SAR",
  },
  {
    id: 2,
    name: "دهان سايبس",
    description: "دهان اقتصادي للجدران الداخلية",
    price: 60,
    currency: "SAR",
  },
  {
    id: 3,
    name: "ورق جدران كلاسيك",
    description: "ورق جدران بنمط كلاسيكي",
    price: 45,
    currency: "SAR",
  },
];
