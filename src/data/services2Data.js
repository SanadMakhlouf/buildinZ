// Mock data for Services2 page
export const categoriesData = [
  {
    id: 1,
    name: "التشطيبات",
    slug: "finishing",
    image: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات التشطيبات الداخلية والخارجية للمباني السكنية والتجارية",
    subcategories: [
      {
        id: 101,
        name: "سيراميك و رخام",
        slug: "tiles-marble",
        image: "https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?q=80&w=800&auto=format&fit=crop",
        description: "تشكيلة واسعة من السيراميك والرخام للأرضيات والجدران",
        services: [
          {
            id: 1001,
            name: "سيراميك أرضيات",
            slug: "floor-tiles",
            image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=600&auto=format&fit=crop",
            description: "سيراميك عالي الجودة للأرضيات بتصاميم متنوعة",
            unit: "متر مربع",
            basePrice: 85,
            formSchema: {
              title: "طلب سيراميك أرضيات",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع السيراميك",
                  field: "tileType",
                  options: [
                    { label: "سيراميك رخامي", image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?q=80&w=400&auto=format&fit=crop", pricePerM2: 120 },
                    { label: "سيراميك خشبي", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400&auto=format&fit=crop", pricePerM2: 95 },
                    { label: "سيراميك إسباني", image: "https://images.unsplash.com/photo-1600566752447-f4c24a0e7c14?q=80&w=400&auto=format&fit=crop", pricePerM2: 150 }
                  ]
                },
                {
                  type: "number",
                  label: "أدخل المساحة (م²)",
                  field: "area",
                  min: 1,
                  placeholder: "أدخل المساحة بالمتر المربع"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج إلى تركيب؟",
                  field: "installation",
                  yesLabel: "نعم", 
                  noLabel: "لا",
                  affectPrice: 30
                },
                {
                  type: "select",
                  label: "اختر مستوى الجودة",
                  field: "quality",
                  options: [
                    { label: "اقتصادي", value: "economy", priceMultiplier: 0.8 },
                    { label: "قياسي", value: "standard", priceMultiplier: 1 },
                    { label: "ممتاز", value: "premium", priceMultiplier: 1.3 }
                  ]
                }
              ]
            }
          },
          {
            id: 1002,
            name: "رخام طبيعي",
            slug: "natural-marble",
            image: "https://images.unsplash.com/photo-1617850687395-620757feb1f3?q=80&w=600&auto=format&fit=crop",
            description: "رخام طبيعي فاخر للأرضيات والجدران",
            unit: "متر مربع",
            basePrice: 250,
            formSchema: {
              title: "طلب رخام طبيعي",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الرخام",
                  field: "marbleType",
                  options: [
                    { label: "رخام كرارة", image: "https://images.unsplash.com/photo-1619785292559-a15caa28bde6?q=80&w=400&auto=format&fit=crop", pricePerM2: 280 },
                    { label: "رخام عماني", image: "https://images.unsplash.com/photo-1618827840222-f6b29afbcc5e?q=80&w=400&auto=format&fit=crop", pricePerM2: 250 },
                    { label: "رخام إيطالي", image: "https://images.unsplash.com/photo-1618827840322-89c06a220afb?q=80&w=400&auto=format&fit=crop", pricePerM2: 350 }
                  ]
                },
                {
                  type: "number",
                  label: "أدخل المساحة (م²)",
                  field: "area",
                  min: 1,
                  placeholder: "أدخل المساحة بالمتر المربع"
                },
                {
                  type: "select",
                  label: "اختر نوع التشطيب",
                  field: "finish",
                  options: [
                    { label: "مصقول", value: "polished", priceAdd: 50 },
                    { label: "مطفي", value: "matte", priceAdd: 30 },
                    { label: "مشطوف", value: "honed", priceAdd: 40 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج إلى تركيب؟",
                  field: "installation",
                  yesLabel: "نعم", 
                  noLabel: "لا",
                  affectPrice: 70
                }
              ]
            }
          }
        ]
      },
      {
        id: 102,
        name: "دهانات",
        slug: "paints",
        image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?q=80&w=800&auto=format&fit=crop",
        description: "دهانات داخلية وخارجية عالية الجودة",
        services: [
          {
            id: 1003,
            name: "دهان داخلي",
            slug: "interior-paint",
            image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop",
            description: "دهانات داخلية بألوان متنوعة وجودة عالية",
            unit: "متر مربع",
            basePrice: 45,
            formSchema: {
              title: "طلب دهان داخلي",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الدهان",
                  field: "paintType",
                  options: [
                    { label: "دهان مطفي", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=400&auto=format&fit=crop", pricePerM2: 45 },
                    { label: "دهان نصف لامع", image: "https://images.unsplash.com/photo-1615800001964-5afd0ae8e49a?q=80&w=400&auto=format&fit=crop", pricePerM2: 55 },
                    { label: "دهان لامع", image: "https://images.unsplash.com/photo-1598301257982-0cf014dabbcd?q=80&w=400&auto=format&fit=crop", pricePerM2: 65 }
                  ]
                },
                {
                  type: "number",
                  label: "أدخل المساحة (م²)",
                  field: "area",
                  min: 1,
                  placeholder: "أدخل المساحة بالمتر المربع"
                },
                {
                  type: "select",
                  label: "عدد الطبقات",
                  field: "coats",
                  options: [
                    { label: "طبقتين", value: 2, priceMultiplier: 1 },
                    { label: "ثلاث طبقات", value: 3, priceMultiplier: 1.4 }
                  ]
                },
                {
                  type: "color-picker",
                  label: "اختر اللون",
                  field: "color",
                  defaultColor: "#FFFFFF"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 2,
    name: "البنية التحتية والمرافق",
    slug: "infrastructure",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات البنية التحتية والمرافق للمباني والمنشآت",
    subcategories: [
      {
        id: 201,
        name: "الكهرباء",
        slug: "electricity",
        image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?q=80&w=800&auto=format&fit=crop",
        description: "خدمات التمديدات والتركيبات الكهربائية",
        services: [
          {
            id: 2001,
            name: "تمديدات كهربائية",
            slug: "electrical-wiring",
            image: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=600&auto=format&fit=crop",
            description: "تمديدات كهربائية للمنازل والمكاتب",
            unit: "نقطة",
            basePrice: 120,
            formSchema: {
              title: "طلب تمديدات كهربائية",
              steps: [
                {
                  type: "number",
                  label: "عدد النقاط الكهربائية",
                  field: "points",
                  min: 1,
                  placeholder: "أدخل عدد النقاط"
                },
                {
                  type: "select",
                  label: "نوع الأسلاك",
                  field: "wireType",
                  options: [
                    { label: "أسلاك قياسية", value: "standard", priceMultiplier: 1 },
                    { label: "أسلاك عالية الجودة", value: "premium", priceMultiplier: 1.5 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج لوحة كهرباء جديدة؟",
                  field: "newPanel",
                  yesLabel: "نعم", 
                  noLabel: "لا",
                  affectPrice: 500
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 3,
    name: "التصميم الداخلي والخارجي",
    slug: "design",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات التصميم الداخلي والخارجي للمباني والمساحات",
    subcategories: []
  },
  {
    id: 4,
    name: "الأنظمة الذكية والأمان",
    slug: "smart-systems",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop",
    description: "أنظمة المنازل الذكية وأنظمة الأمان والمراقبة",
    subcategories: []
  },
  {
    id: 5,
    name: "الخدمات العامة",
    slug: "general-services",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات عامة للمباني والمنشآت",
    subcategories: []
  }
];

// Price calculation helper function
export const calculatePrice = (service, formData) => {
  if (!service || !formData) return 0;
  
  let totalPrice = 0;
  const schema = service.formSchema;
  
  // Process each step in the form schema
  schema.steps.forEach(step => {
    const value = formData[step.field];
    
    switch(step.type) {
      case 'image-select':
        const selectedOption = step.options.find(opt => opt.label === value);
        if (selectedOption) {
          if (step.field === 'tileType' || step.field === 'marbleType' || step.field === 'paintType') {
            // For area-based pricing
            totalPrice = selectedOption.pricePerM2 * (formData.area || 1);
          } else {
            totalPrice += selectedOption.price || 0;
          }
        }
        break;
        
      case 'number':
        if (step.field === 'area' && formData.tileType) {
          // Area already calculated in tileType
        } else if (step.field === 'points') {
          // For electrical points
          totalPrice = service.basePrice * (value || 1);
        }
        break;
        
      case 'toggle':
        if (value === true && step.affectPrice) {
          if (step.field === 'installation' && formData.area) {
            totalPrice += step.affectPrice * formData.area;
          } else {
            totalPrice += step.affectPrice;
          }
        }
        break;
        
      case 'select':
        const selected = step.options.find(opt => opt.value === value || opt.label === value);
        if (selected) {
          if (selected.priceMultiplier) {
            totalPrice = totalPrice * selected.priceMultiplier;
          }
          if (selected.priceAdd) {
            totalPrice += selected.priceAdd * (formData.area || 1);
          }
        }
        break;
        
      default:
        break;
    }
  });
  
  return Math.round(totalPrice);
}; 