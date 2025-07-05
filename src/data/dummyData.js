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
    name: 'دريل كهربائي احترافي',
    price: 299,
    originalPrice: 399,
    category: 'tools',
    categoryName: 'أدوات',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500',
    rating: 4.5,
    reviews: 128,
    description: 'دريل كهربائي قوي ومتين مع مجموعة من الرؤوس المتنوعة. مصمم للاستخدام المهني والمنزلي مع ضمان الجودة والأداء العالي.',
    features: ['قوة 800 واط', 'سرعة متغيرة', 'مقبض مريح', 'ضمان سنتين', 'مقاوم للغبار', 'إضاءة LED مدمجة'],
    inStock: true,
    stock: 25,
    brand: 'BuildPro',
    discount: 25,
    weight: '1.2 كغم',
    dimensions: '25 × 8 × 20 سم'
  },
  {
    id: 2,
    name: 'طقم مفاتيح شاملة',
    price: 149,
    originalPrice: 199,
    category: 'tools',
    categoryName: 'أدوات',
    image: 'https://images.unsplash.com/photo-1609205807107-e8ec2120f9de?w=500',
    rating: 4.8,
    reviews: 89,
    description: 'طقم مفاتيح كامل من الستانلس ستيل عالي الجودة. يشمل جميع الأحجام المطلوبة للاستخدام المهني والمنزلي.',
    features: ['32 قطعة', 'ستانلس ستيل', 'حقيبة تنظيم', 'مقاومة للصدأ', 'مقابض مريحة', 'ضمان مدى الحياة'],
    inStock: true,
    stock: 40,
    brand: 'ToolMaster',
    discount: 25,
    weight: '2.5 كغم',
    dimensions: '35 × 25 × 5 سم'
  },
  {
    id: 3,
    name: 'مواد بناء - أسمنت',
    price: 45,
    originalPrice: 50,
    category: 'materials',
    categoryName: 'مواد البناء',
    image: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=500',
    rating: 4.3,
    reviews: 234,
    description: 'أسمنت عالي الجودة مناسب لجميع أعمال البناء والإنشاءات. يوفر قوة تحمل عالية وثبات في جميع الظروف الجوية.',
    features: ['كيس 50 كغم', 'جودة عالية', 'سريع التماسك', 'مقاوم للعوامل الجوية', 'مطابق للمواصفات', 'توصيل مجاني'],
    inStock: true,
    stock: 100,
    brand: 'CementPro',
    discount: 10,
    weight: '50 كغم',
    dimensions: '60 × 40 × 15 سم'
  },
  {
    id: 4,
    name: 'دهان داخلي فاخر',
    price: 89,
    originalPrice: 120,
    category: 'paint',
    categoryName: 'دهانات',
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=500',
    rating: 4.7,
    reviews: 156,
    description: 'دهان داخلي عالي الجودة بألوان متنوعة وتغطية ممتازة. مصنوع من مواد صديقة للبيئة وآمنة للاستخدام المنزلي.',
    features: ['4 لتر', 'قابل للغسيل', 'بدون رائحة', 'تغطية 40 متر مربع', 'سريع الجفاف', '12 لون متاح'],
    inStock: true,
    stock: 60,
    brand: 'ColorMax',
    discount: 26,
    weight: '4.2 كغم',
    dimensions: '20 × 20 × 25 سم'
  },
  {
    id: 5,
    name: 'مجموعة براغي متنوعة',
    price: 35,
    originalPrice: 45,
    category: 'hardware',
    categoryName: 'أجهزة',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    rating: 4.4,
    reviews: 92,
    description: 'مجموعة شاملة من البراغي بأحجام وأنواع مختلفة. مناسبة لجميع أعمال التركيب والصيانة المنزلية والمهنية.',
    features: ['200 قطعة', 'أحجام متنوعة', 'معدن مقاوم للصدأ', 'علبة تنظيم', 'جودة عالية', 'سهولة الاستخدام'],
    inStock: true,
    stock: 75,
    brand: 'FastenPro',
    discount: 22,
    weight: '0.8 كغم',
    dimensions: '15 × 10 × 8 سم'
  },
  {
    id: 6,
    name: 'منشار كهربائي دائري',
    price: 449,
    originalPrice: 599,
    category: 'tools',
    categoryName: 'أدوات',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500',
    rating: 4.6,
    reviews: 67,
    description: 'منشار كهربائي دائري قوي للقطع الدقيق في الخشب والمعادن. مزود بنظام أمان متقدم وتحكم دقيق في السرعة.',
    features: ['1200 واط', 'شفرة 190mm', 'قاعدة قابلة للتعديل', 'نظام أمان متقدم', 'كابل 3 متر', 'حقيبة حمل'],
    inStock: true,
    stock: 15,
    brand: 'CutMaster',
    discount: 25,
    weight: '3.8 كغم',
    dimensions: '35 × 25 × 20 سم'
  },
  {
    id: 7,
    name: 'بلاط سيراميك فاخر',
    price: 25,
    originalPrice: 35,
    category: 'materials',
    categoryName: 'مواد البناء',
    image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=500',
    rating: 4.5,
    reviews: 203,
    description: 'بلاط سيراميك عالي الجودة بتصاميم عصرية ومتنوعة. مقاوم للماء والبقع مع سهولة في التنظيف والصيانة.',
    features: ['60x60 سم', 'مقاوم للماء', 'سهل التنظيف', 'متوفر بألوان متعددة', 'مقاوم للخدش', 'ضمان 10 سنوات'],
    inStock: true,
    stock: 200,
    brand: 'TilePro',
    discount: 29,
    weight: '1.5 كغم/قطعة',
    dimensions: '60 × 60 × 1 سم'
  },
  {
    id: 8,
    name: 'مولد كهرباء محمول',
    price: 899,
    originalPrice: 1199,
    category: 'electrical',
    categoryName: 'كهربائيات',
    image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=500',
    rating: 4.8,
    reviews: 45,
    description: 'مولد كهرباء محمول وموثوق لجميع احتياجاتك. مناسب للاستخدام المنزلي والتجاري مع تشغيل هادئ وكفاءة عالية.',
    features: ['3000 واط', 'تشغيل هادئ', 'خزان 15 لتر', 'بدء كهربائي', '4 مخارج كهرباء', 'عجلات للنقل'],
    inStock: true,
    stock: 8,
    brand: 'PowerGen',
    discount: 25,
    weight: '45 كغم',
    dimensions: '60 × 45 × 50 سم'
  }
];
