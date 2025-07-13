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
          },
          {
            id: 1004,
            name: "دهان خارجي",
            slug: "exterior-paint",
            image: "https://images.unsplash.com/photo-1562113530-57ba467cea38?q=80&w=600&auto=format&fit=crop",
            description: "دهانات خارجية مقاومة للعوامل الجوية",
            unit: "متر مربع",
            basePrice: 60,
            formSchema: {
              title: "طلب دهان خارجي",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الدهان",
                  field: "paintType",
                  options: [
                    { label: "دهان أكريليك", image: "https://images.unsplash.com/photo-1562113530-57ba467cea38?q=80&w=400&auto=format&fit=crop", pricePerM2: 60 },
                    { label: "دهان سيليكوني", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?q=80&w=400&auto=format&fit=crop", pricePerM2: 85 },
                    { label: "دهان إيبوكسي", image: "https://images.unsplash.com/photo-1615800001964-5afd0ae8e49a?q=80&w=400&auto=format&fit=crop", pricePerM2: 110 }
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
                  label: "هل تحتاج إلى معالجة الجدران؟",
                  field: "wallTreatment",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 25
                }
              ]
            }
          },
          {
            id: 1005,
            name: "ورق جدران",
            slug: "wallpaper",
            image: "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?q=80&w=600&auto=format&fit=crop",
            description: "ورق جدران بتصاميم عصرية وكلاسيكية",
            unit: "لفة",
            basePrice: 180,
            formSchema: {
              title: "طلب ورق جدران",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع ورق الجدران",
                  field: "wallpaperType",
                  options: [
                    { label: "ورق فينيل", image: "https://images.unsplash.com/photo-1615874959474-d609969a20ed?q=80&w=400&auto=format&fit=crop", pricePerRoll: 180 },
                    { label: "ورق قماشي", image: "https://images.unsplash.com/photo-1618221469555-7f3ad97540d6?q=80&w=400&auto=format&fit=crop", pricePerRoll: 250 },
                    { label: "ورق ثلاثي الأبعاد", image: "https://images.unsplash.com/photo-1604709177225-055f99402ea3?q=80&w=400&auto=format&fit=crop", pricePerRoll: 320 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد اللفات المطلوبة",
                  field: "rolls",
                  min: 1,
                  placeholder: "أدخل عدد اللفات"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج إلى تركيب؟",
                  field: "installation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 50
                }
              ]
            }
          }
        ]
      },
      {
        id: 103,
        name: "أرضيات",
        slug: "flooring",
        image: "https://images.unsplash.com/photo-1560440021-33f9b867899d?q=80&w=800&auto=format&fit=crop",
        description: "جميع أنواع الأرضيات الحديثة والكلاسيكية",
        services: [
          {
            id: 1006,
            name: "باركيه خشبي",
            slug: "wooden-parquet",
            image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=600&auto=format&fit=crop",
            description: "باركيه خشبي طبيعي وصناعي عالي الجودة",
            unit: "متر مربع",
            basePrice: 120,
            formSchema: {
              title: "طلب باركيه خشبي",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الباركيه",
                  field: "parquetType",
                  options: [
                    { label: "باركيه ألماني", image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=400&auto=format&fit=crop", pricePerM2: 150 },
                    { label: "باركيه تركي", image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=400&auto=format&fit=crop", pricePerM2: 120 },
                    { label: "باركيه سويسري", image: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?q=80&w=400&auto=format&fit=crop", pricePerM2: 200 }
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
                  label: "سماكة الباركيه",
                  field: "thickness",
                  options: [
                    { label: "8 مم", value: "8mm", priceMultiplier: 0.9 },
                    { label: "10 مم", value: "10mm", priceMultiplier: 1 },
                    { label: "12 مم", value: "12mm", priceMultiplier: 1.2 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج إلى عازل صوتي؟",
                  field: "soundInsulation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 15
                }
              ]
            }
          },
          {
            id: 1007,
            name: "فينيل",
            slug: "vinyl-flooring",
            image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=600&auto=format&fit=crop",
            description: "أرضيات فينيل مقاومة للماء والخدش",
            unit: "متر مربع",
            basePrice: 85,
            formSchema: {
              title: "طلب أرضيات فينيل",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الفينيل",
                  field: "vinylType",
                  options: [
                    { label: "فينيل SPC", image: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?q=80&w=400&auto=format&fit=crop", pricePerM2: 95 },
                    { label: "فينيل LVT", image: "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=400&auto=format&fit=crop", pricePerM2: 85 },
                    { label: "فينيل WPC", image: "https://images.unsplash.com/photo-1560184897-ae75f418493e?q=80&w=400&auto=format&fit=crop", pricePerM2: 110 }
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
                  affectPrice: 25
                }
              ]
            }
          }
        ]
      },
      {
        id: 104,
        name: "أسقف وجبس",
        slug: "ceilings-gypsum",
        image: "https://images.unsplash.com/photo-1604709177595-ee9c2580e9a3?q=80&w=800&auto=format&fit=crop",
        description: "تصاميم أسقف جبسية وديكورات حديثة",
        services: [
          {
            id: 1008,
            name: "أسقف جبسية",
            slug: "gypsum-ceilings",
            image: "https://images.unsplash.com/photo-1604709177595-ee9c2580e9a3?q=80&w=600&auto=format&fit=crop",
            description: "أسقف جبسية بتصاميم عصرية",
            unit: "متر مربع",
            basePrice: 95,
            formSchema: {
              title: "طلب أسقف جبسية",
              steps: [
                {
                  type: "image-select",
                  label: "اختر التصميم",
                  field: "design",
                  options: [
                    { label: "تصميم كلاسيكي", image: "https://images.unsplash.com/photo-1604709177225-055f99402ea3?q=80&w=400&auto=format&fit=crop", pricePerM2: 95 },
                    { label: "تصميم مودرن", image: "https://images.unsplash.com/photo-1604709177595-ee9c2580e9a3?q=80&w=400&auto=format&fit=crop", pricePerM2: 110 },
                    { label: "تصميم مخصص", image: "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=400&auto=format&fit=crop", pricePerM2: 150 }
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
                  label: "هل تريد إضاءة مخفية؟",
                  field: "hiddenLighting",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 35
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
          },
          {
            id: 2002,
            name: "لوحات كهربائية",
            slug: "electrical-panels",
            image: "https://images.unsplash.com/photo-1565127752132-8f33d14a9c49?q=80&w=600&auto=format&fit=crop",
            description: "تركيب وصيانة لوحات الكهرباء الرئيسية والفرعية",
            unit: "لوحة",
            basePrice: 800,
            formSchema: {
              title: "طلب لوحة كهربائية",
              steps: [
                {
                  type: "select",
                  label: "نوع اللوحة",
                  field: "panelType",
                  options: [
                    { label: "لوحة رئيسية", value: "main", price: 1200 },
                    { label: "لوحة فرعية", value: "sub", price: 800 },
                    { label: "لوحة توزيع", value: "distribution", price: 600 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد القواطع",
                  field: "breakers",
                  min: 1,
                  placeholder: "أدخل عدد القواطع"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج قاطع تيار متبقي؟",
                  field: "rcd",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 150
                }
              ]
            }
          },
          {
            id: 2003,
            name: "إنارة LED",
            slug: "led-lighting",
            image: "https://images.unsplash.com/photo-1524634126442-357e0eac3c14?q=80&w=600&auto=format&fit=crop",
            description: "تركيب أنظمة إنارة LED موفرة للطاقة",
            unit: "نقطة إنارة",
            basePrice: 85,
            formSchema: {
              title: "طلب إنارة LED",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الإنارة",
                  field: "lightType",
                  options: [
                    { label: "سبوت لايت", image: "https://images.unsplash.com/photo-1524634126442-357e0eac3c14?q=80&w=400&auto=format&fit=crop", pricePerUnit: 85 },
                    { label: "شريط LED", image: "https://images.unsplash.com/photo-1565636192335-f6667d29b0ff?q=80&w=400&auto=format&fit=crop", pricePerUnit: 65 },
                    { label: "لمبة ذكية", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop", pricePerUnit: 120 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد نقاط الإنارة",
                  field: "points",
                  min: 1,
                  placeholder: "أدخل عدد النقاط"
                },
                {
                  type: "toggle",
                  label: "هل تريد التحكم عن بعد؟",
                  field: "remoteControl",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 25
                }
              ]
            }
          }
        ]
      },
      {
        id: 202,
        name: "السباكة",
        slug: "plumbing",
        image: "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?q=80&w=800&auto=format&fit=crop",
        description: "خدمات السباكة والصرف الصحي",
        services: [
          {
            id: 2004,
            name: "تمديدات مياه",
            slug: "water-piping",
            image: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
            description: "تمديدات مياه الشرب والصرف الصحي",
            unit: "نقطة",
            basePrice: 150,
            formSchema: {
              title: "طلب تمديدات مياه",
              steps: [
                {
                  type: "select",
                  label: "نوع الأنابيب",
                  field: "pipeType",
                  options: [
                    { label: "PPR", value: "ppr", priceMultiplier: 1 },
                    { label: "PVC", value: "pvc", priceMultiplier: 0.8 },
                    { label: "نحاس", value: "copper", priceMultiplier: 1.5 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد النقاط",
                  field: "points",
                  min: 1,
                  placeholder: "أدخل عدد النقاط"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج عزل حراري للأنابيب؟",
                  field: "insulation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 20
                }
              ]
            }
          },
          {
            id: 2005,
            name: "أدوات صحية",
            slug: "sanitary-fixtures",
            image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=600&auto=format&fit=crop",
            description: "توريد وتركيب الأدوات الصحية",
            unit: "قطعة",
            basePrice: 350,
            formSchema: {
              title: "طلب أدوات صحية",
              steps: [
                {
                  type: "image-select",
                  label: "اختر نوع الأداة",
                  field: "fixtureType",
                  options: [
                    { label: "مرحاض", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop", price: 450 },
                    { label: "مغسلة", image: "https://images.unsplash.com/photo-1584622781867-fcb232f9654e?q=80&w=400&auto=format&fit=crop", price: 350 },
                    { label: "دش", image: "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?q=80&w=400&auto=format&fit=crop", price: 550 }
                  ]
                },
                {
                  type: "select",
                  label: "مستوى الجودة",
                  field: "quality",
                  options: [
                    { label: "اقتصادي", value: "economy", priceMultiplier: 0.7 },
                    { label: "متوسط", value: "medium", priceMultiplier: 1 },
                    { label: "فاخر", value: "luxury", priceMultiplier: 1.8 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تركيب؟",
                  field: "installation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 100
                }
              ]
            }
          }
        ]
      },
      {
        id: 203,
        name: "التكييف والتبريد",
        slug: "hvac",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
        description: "أنظمة التكييف والتبريد والتدفئة",
        services: [
          {
            id: 2006,
            name: "تكييف سبليت",
            slug: "split-ac",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
            description: "توريد وتركيب أجهزة التكييف السبليت",
            unit: "وحدة",
            basePrice: 1800,
            formSchema: {
              title: "طلب تكييف سبليت",
              steps: [
                {
                  type: "select",
                  label: "القدرة (طن)",
                  field: "capacity",
                  options: [
                    { label: "1 طن", value: "1", price: 1500 },
                    { label: "1.5 طن", value: "1.5", price: 1800 },
                    { label: "2 طن", value: "2", price: 2200 },
                    { label: "2.5 طن", value: "2.5", price: 2600 }
                  ]
                },
                {
                  type: "select",
                  label: "نوع التكييف",
                  field: "type",
                  options: [
                    { label: "عادي", value: "normal", priceMultiplier: 1 },
                    { label: "انفرتر", value: "inverter", priceMultiplier: 1.3 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد الوحدات",
                  field: "units",
                  min: 1,
                  placeholder: "أدخل عدد الوحدات"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تمديدات نحاس؟",
                  field: "copperPiping",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 300
                }
              ]
            }
          },
          {
            id: 2007,
            name: "تكييف مركزي",
            slug: "central-ac",
            image: "https://images.unsplash.com/photo-1631545806609-24040f63c42f?q=80&w=600&auto=format&fit=crop",
            description: "أنظمة التكييف المركزي للمباني الكبيرة",
            unit: "نظام",
            basePrice: 15000,
            formSchema: {
              title: "طلب تكييف مركزي",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 100,
                  placeholder: "أدخل المساحة المراد تكييفها"
                },
                {
                  type: "select",
                  label: "نوع النظام",
                  field: "systemType",
                  options: [
                    { label: "VRF", value: "vrf", pricePerM2: 150 },
                    { label: "Chiller", value: "chiller", pricePerM2: 180 },
                    { label: "Package Unit", value: "package", pricePerM2: 120 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج نظام تحكم ذكي؟",
                  field: "smartControl",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 5000
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
    subcategories: [
      {
        id: 301,
        name: "التصميم الداخلي",
        slug: "interior-design",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop",
        description: "تصميم داخلي متكامل للمساحات السكنية والتجارية",
        services: [
          {
            id: 3001,
            name: "تصميم غرف المعيشة",
            slug: "living-room-design",
            image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop",
            description: "تصميم غرف معيشة عصرية ومريحة",
            unit: "غرفة",
            basePrice: 2500,
            formSchema: {
              title: "طلب تصميم غرفة معيشة",
              steps: [
                {
                  type: "number",
                  label: "مساحة الغرفة (م²)",
                  field: "area",
                  min: 10,
                  placeholder: "أدخل مساحة الغرفة"
                },
                {
                  type: "image-select",
                  label: "اختر النمط المفضل",
                  field: "style",
                  options: [
                    { label: "مودرن", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=400&auto=format&fit=crop", priceAdd: 0 },
                    { label: "كلاسيكي", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop", priceAdd: 500 },
                    { label: "معاصر", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=400&auto=format&fit=crop", priceAdd: 300 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد تصميم ثلاثي الأبعاد؟",
                  field: "3dDesign",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 800
                },
                {
                  type: "select",
                  label: "مستوى التفاصيل",
                  field: "detailLevel",
                  options: [
                    { label: "أساسي", value: "basic", priceMultiplier: 1 },
                    { label: "متقدم", value: "advanced", priceMultiplier: 1.5 },
                    { label: "احترافي", value: "professional", priceMultiplier: 2 }
                  ]
                }
              ]
            }
          },
          {
            id: 3002,
            name: "تصميم المطابخ",
            slug: "kitchen-design",
            image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=600&auto=format&fit=crop",
            description: "تصميم مطابخ عملية وأنيقة",
            unit: "مطبخ",
            basePrice: 3500,
            formSchema: {
              title: "طلب تصميم مطبخ",
              steps: [
                {
                  type: "select",
                  label: "شكل المطبخ",
                  field: "layout",
                  options: [
                    { label: "مطبخ مستقيم", value: "straight", priceMultiplier: 1 },
                    { label: "مطبخ L", value: "l-shape", priceMultiplier: 1.2 },
                    { label: "مطبخ U", value: "u-shape", priceMultiplier: 1.4 },
                    { label: "مطبخ جزيرة", value: "island", priceMultiplier: 1.6 }
                  ]
                },
                {
                  type: "number",
                  label: "طول المطبخ (متر)",
                  field: "length",
                  min: 2,
                  placeholder: "أدخل طول المطبخ"
                },
                {
                  type: "image-select",
                  label: "اختر المواد",
                  field: "material",
                  options: [
                    { label: "خشب طبيعي", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400&auto=format&fit=crop", pricePerMeter: 800 },
                    { label: "MDF", image: "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?q=80&w=400&auto=format&fit=crop", pricePerMeter: 500 },
                    { label: "أكريليك", image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?q=80&w=400&auto=format&fit=crop", pricePerMeter: 650 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد أجهزة مدمجة؟",
                  field: "builtInAppliances",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 5000
                }
              ]
            }
          },
          {
            id: 3003,
            name: "تصميم غرف النوم",
            slug: "bedroom-design",
            image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop",
            description: "تصميم غرف نوم مريحة وأنيقة",
            unit: "غرفة",
            basePrice: 2000,
            formSchema: {
              title: "طلب تصميم غرفة نوم",
              steps: [
                {
                  type: "number",
                  label: "مساحة الغرفة (م²)",
                  field: "area",
                  min: 9,
                  placeholder: "أدخل مساحة الغرفة"
                },
                {
                  type: "select",
                  label: "نوع الغرفة",
                  field: "roomType",
                  options: [
                    { label: "غرفة رئيسية", value: "master", priceMultiplier: 1.3 },
                    { label: "غرفة عادية", value: "regular", priceMultiplier: 1 },
                    { label: "غرفة أطفال", value: "kids", priceMultiplier: 1.2 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد خزانة مدمجة؟",
                  field: "builtInCloset",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 1500
                }
              ]
            }
          }
        ]
      },
      {
        id: 302,
        name: "التصميم الخارجي",
        slug: "exterior-design",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        description: "تصميم واجهات وحدائق خارجية",
        services: [
          {
            id: 3004,
            name: "تصميم واجهات",
            slug: "facade-design",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=600&auto=format&fit=crop",
            description: "تصميم واجهات معمارية مميزة",
            unit: "واجهة",
            basePrice: 5000,
            formSchema: {
              title: "طلب تصميم واجهة",
              steps: [
                {
                  type: "number",
                  label: "مساحة الواجهة (م²)",
                  field: "area",
                  min: 20,
                  placeholder: "أدخل مساحة الواجهة"
                },
                {
                  type: "image-select",
                  label: "اختر النمط المعماري",
                  field: "architecturalStyle",
                  options: [
                    { label: "حديث", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop", pricePerM2: 50 },
                    { label: "كلاسيكي", image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=400&auto=format&fit=crop", pricePerM2: 70 },
                    { label: "إسلامي", image: "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?q=80&w=400&auto=format&fit=crop", pricePerM2: 80 }
                  ]
                },
                {
                  type: "select",
                  label: "المواد المستخدمة",
                  field: "materials",
                  options: [
                    { label: "حجر طبيعي", value: "natural-stone", priceMultiplier: 1.5 },
                    { label: "GRC", value: "grc", priceMultiplier: 1.2 },
                    { label: "دهان خارجي", value: "paint", priceMultiplier: 1 }
                  ]
                }
              ]
            }
          },
          {
            id: 3005,
            name: "تصميم حدائق",
            slug: "garden-design",
            image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=600&auto=format&fit=crop",
            description: "تصميم وتنسيق الحدائق والمساحات الخضراء",
            unit: "حديقة",
            basePrice: 3000,
            formSchema: {
              title: "طلب تصميم حديقة",
              steps: [
                {
                  type: "number",
                  label: "مساحة الحديقة (م²)",
                  field: "area",
                  min: 20,
                  placeholder: "أدخل مساحة الحديقة"
                },
                {
                  type: "image-select",
                  label: "اختر نمط الحديقة",
                  field: "gardenStyle",
                  options: [
                    { label: "حديقة طبيعية", image: "https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?q=80&w=400&auto=format&fit=crop", pricePerM2: 30 },
                    { label: "حديقة صحراوية", image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?q=80&w=400&auto=format&fit=crop", pricePerM2: 25 },
                    { label: "حديقة يابانية", image: "https://images.unsplash.com/photo-1580818135730-ebd11086660b?q=80&w=400&auto=format&fit=crop", pricePerM2: 45 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد نظام ري أوتوماتيكي؟",
                  field: "automaticIrrigation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 50
                },
                {
                  type: "toggle",
                  label: "هل تريد إضاءة حديقة؟",
                  field: "gardenLighting",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 30
                }
              ]
            }
          }
        ]
      },
      {
        id: 303,
        name: "الأثاث والديكور",
        slug: "furniture-decor",
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop",
        description: "تصميم وتوريد الأثاث والديكورات",
        services: [
          {
            id: 3006,
            name: "أثاث مخصص",
            slug: "custom-furniture",
            image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
            description: "تصميم وتصنيع أثاث حسب الطلب",
            unit: "قطعة",
            basePrice: 1500,
            formSchema: {
              title: "طلب أثاث مخصص",
              steps: [
                {
                  type: "select",
                  label: "نوع الأثاث",
                  field: "furnitureType",
                  options: [
                    { label: "كنبة", value: "sofa", price: 2500 },
                    { label: "طاولة طعام", value: "dining-table", price: 1800 },
                    { label: "سرير", value: "bed", price: 2200 },
                    { label: "مكتب", value: "desk", price: 1500 }
                  ]
                },
                {
                  type: "select",
                  label: "المادة",
                  field: "material",
                  options: [
                    { label: "خشب طبيعي", value: "solid-wood", priceMultiplier: 1.5 },
                    { label: "MDF", value: "mdf", priceMultiplier: 1 },
                    { label: "معدن وخشب", value: "metal-wood", priceMultiplier: 1.3 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد تنجيد؟",
                  field: "upholstery",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 800
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 4,
    name: "الأنظمة الذكية والأمان",
    slug: "smart-systems",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=1200&auto=format&fit=crop",
    description: "أنظمة المنازل الذكية وأنظمة الأمان والمراقبة",
    subcategories: [
      {
        id: 401,
        name: "المنازل الذكية",
        slug: "smart-home",
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=800&auto=format&fit=crop",
        description: "أنظمة التحكم الذكي في المنزل",
        services: [
          {
            id: 4001,
            name: "نظام إضاءة ذكي",
            slug: "smart-lighting",
            image: "https://images.unsplash.com/photo-1565636192335-f6667d29b0ff?q=80&w=600&auto=format&fit=crop",
            description: "أنظمة إضاءة ذكية قابلة للتحكم عن بعد",
            unit: "غرفة",
            basePrice: 800,
            formSchema: {
              title: "طلب نظام إضاءة ذكي",
              steps: [
                {
                  type: "number",
                  label: "عدد الغرف",
                  field: "rooms",
                  min: 1,
                  placeholder: "أدخل عدد الغرف"
                },
                {
                  type: "select",
                  label: "نوع النظام",
                  field: "systemType",
                  options: [
                    { label: "نظام أساسي", value: "basic", pricePerRoom: 800 },
                    { label: "نظام متقدم", value: "advanced", pricePerRoom: 1200 },
                    { label: "نظام احترافي", value: "professional", pricePerRoom: 1800 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد التحكم الصوتي؟",
                  field: "voiceControl",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 300
                },
                {
                  type: "toggle",
                  label: "هل تريد مستشعرات حركة؟",
                  field: "motionSensors",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 150
                }
              ]
            }
          },
          {
            id: 4002,
            name: "نظام تحكم مناخي ذكي",
            slug: "smart-climate",
            image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=600&auto=format&fit=crop",
            description: "أنظمة تحكم ذكية في التكييف والتدفئة",
            unit: "نظام",
            basePrice: 2500,
            formSchema: {
              title: "طلب نظام تحكم مناخي ذكي",
              steps: [
                {
                  type: "number",
                  label: "عدد وحدات التكييف",
                  field: "acUnits",
                  min: 1,
                  placeholder: "أدخل عدد الوحدات"
                },
                {
                  type: "select",
                  label: "نوع التحكم",
                  field: "controlType",
                  options: [
                    { label: "تحكم Wi-Fi", value: "wifi", price: 2500 },
                    { label: "تحكم Zigbee", value: "zigbee", price: 3000 },
                    { label: "تحكم متكامل", value: "integrated", price: 4000 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد جدولة أوتوماتيكية؟",
                  field: "autoScheduling",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 500
                }
              ]
            }
          },
          {
            id: 4003,
            name: "نظام ستائر ذكية",
            slug: "smart-curtains",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
            description: "ستائر كهربائية ذكية قابلة للتحكم",
            unit: "نافذة",
            basePrice: 600,
            formSchema: {
              title: "طلب نظام ستائر ذكية",
              steps: [
                {
                  type: "number",
                  label: "عدد النوافذ",
                  field: "windows",
                  min: 1,
                  placeholder: "أدخل عدد النوافذ"
                },
                {
                  type: "select",
                  label: "نوع المحرك",
                  field: "motorType",
                  options: [
                    { label: "محرك عادي", value: "standard", pricePerWindow: 600 },
                    { label: "محرك صامت", value: "silent", pricePerWindow: 850 },
                    { label: "محرك ذكي", value: "smart", pricePerWindow: 1100 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد مستشعرات ضوء؟",
                  field: "lightSensors",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 200
                }
              ]
            }
          }
        ]
      },
      {
        id: 402,
        name: "أنظمة الأمان",
        slug: "security-systems",
        image: "https://images.unsplash.com/photo-1448932223592-d1fc686e76ea?q=80&w=800&auto=format&fit=crop",
        description: "أنظمة الحماية والأمان للمباني",
        services: [
          {
            id: 4004,
            name: "كاميرات مراقبة",
            slug: "cctv-cameras",
            image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop",
            description: "أنظمة كاميرات مراقبة عالية الدقة",
            unit: "كاميرا",
            basePrice: 450,
            formSchema: {
              title: "طلب نظام كاميرات مراقبة",
              steps: [
                {
                  type: "number",
                  label: "عدد الكاميرات",
                  field: "cameras",
                  min: 1,
                  placeholder: "أدخل عدد الكاميرات"
                },
                {
                  type: "image-select",
                  label: "نوع الكاميرات",
                  field: "cameraType",
                  options: [
                    { label: "كاميرا 2MP", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=400&auto=format&fit=crop", pricePerCamera: 450 },
                    { label: "كاميرا 4MP", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop", pricePerCamera: 650 },
                    { label: "كاميرا 4K", image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=400&auto=format&fit=crop", pricePerCamera: 950 }
                  ]
                },
                {
                  type: "select",
                  label: "نظام التسجيل",
                  field: "recordingSystem",
                  options: [
                    { label: "NVR 8 قنوات", value: "nvr8", price: 800 },
                    { label: "NVR 16 قناة", value: "nvr16", price: 1200 },
                    { label: "NVR 32 قناة", value: "nvr32", price: 2000 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد رؤية ليلية ملونة؟",
                  field: "colorNightVision",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 100
                }
              ]
            }
          },
          {
            id: 4005,
            name: "نظام إنذار",
            slug: "alarm-system",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
            description: "أنظمة إنذار متطورة ضد السرقة",
            unit: "نظام",
            basePrice: 1500,
            formSchema: {
              title: "طلب نظام إنذار",
              steps: [
                {
                  type: "number",
                  label: "عدد المستشعرات",
                  field: "sensors",
                  min: 4,
                  placeholder: "أدخل عدد المستشعرات"
                },
                {
                  type: "select",
                  label: "نوع النظام",
                  field: "systemType",
                  options: [
                    { label: "نظام سلكي", value: "wired", price: 1500 },
                    { label: "نظام لاسلكي", value: "wireless", price: 2000 },
                    { label: "نظام هجين", value: "hybrid", price: 2500 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد ربط مع مركز مراقبة؟",
                  field: "monitoringCenter",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 100
                }
              ]
            }
          },
          {
            id: 4006,
            name: "أقفال ذكية",
            slug: "smart-locks",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
            description: "أقفال إلكترونية ذكية للأبواب",
            unit: "قفل",
            basePrice: 800,
            formSchema: {
              title: "طلب أقفال ذكية",
              steps: [
                {
                  type: "number",
                  label: "عدد الأقفال",
                  field: "locks",
                  min: 1,
                  placeholder: "أدخل عدد الأقفال"
                },
                {
                  type: "select",
                  label: "نوع القفل",
                  field: "lockType",
                  options: [
                    { label: "قفل بصمة", value: "fingerprint", pricePerLock: 800 },
                    { label: "قفل رقمي", value: "digital", pricePerLock: 600 },
                    { label: "قفل بالوجه", value: "facial", pricePerLock: 1200 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد التحكم عن بعد؟",
                  field: "remoteControl",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 200
                }
              ]
            }
          }
        ]
      },
      {
        id: 403,
        name: "أنظمة الصوت والترفيه",
        slug: "audio-entertainment",
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=800&auto=format&fit=crop",
        description: "أنظمة صوتية وترفيهية متكاملة",
        services: [
          {
            id: 4007,
            name: "نظام صوت متعدد الغرف",
            slug: "multi-room-audio",
            image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=600&auto=format&fit=crop",
            description: "نظام صوتي متكامل لجميع أنحاء المنزل",
            unit: "غرفة",
            basePrice: 1200,
            formSchema: {
              title: "طلب نظام صوت متعدد الغرف",
              steps: [
                {
                  type: "number",
                  label: "عدد الغرف",
                  field: "rooms",
                  min: 2,
                  placeholder: "أدخل عدد الغرف"
                },
                {
                  type: "select",
                  label: "جودة السماعات",
                  field: "speakerQuality",
                  options: [
                    { label: "قياسية", value: "standard", pricePerRoom: 1200 },
                    { label: "متميزة", value: "premium", pricePerRoom: 1800 },
                    { label: "احترافية", value: "professional", pricePerRoom: 2500 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد تحكم صوتي؟",
                  field: "voiceControl",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 400
                }
              ]
            }
          },
          {
            id: 4008,
            name: "سينما منزلية",
            slug: "home-cinema",
            image: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=600&auto=format&fit=crop",
            description: "نظام سينما منزلية متكامل",
            unit: "نظام",
            basePrice: 8000,
            formSchema: {
              title: "طلب نظام سينما منزلية",
              steps: [
                {
                  type: "select",
                  label: "حجم الشاشة",
                  field: "screenSize",
                  options: [
                    { label: "100 بوصة", value: "100", price: 8000 },
                    { label: "120 بوصة", value: "120", price: 10000 },
                    { label: "150 بوصة", value: "150", price: 13000 }
                  ]
                },
                {
                  type: "select",
                  label: "نظام الصوت",
                  field: "audioSystem",
                  options: [
                    { label: "5.1 قنوات", value: "5.1", priceAdd: 3000 },
                    { label: "7.1 قنوات", value: "7.1", priceAdd: 5000 },
                    { label: "Dolby Atmos", value: "atmos", priceAdd: 8000 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد عزل صوتي للغرفة؟",
                  field: "soundproofing",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 5000
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 5,
    name: "الخدمات العامة",
    slug: "general-services",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات عامة للمباني والمنشآت",
    subcategories: [
      {
        id: 501,
        name: "النظافة والصيانة",
        slug: "cleaning-maintenance",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=800&auto=format&fit=crop",
        description: "خدمات النظافة والصيانة الدورية",
        services: [
          {
            id: 5001,
            name: "تنظيف عميق",
            slug: "deep-cleaning",
            image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600&auto=format&fit=crop",
            description: "خدمة تنظيف عميق شامل للمباني",
            unit: "متر مربع",
            basePrice: 25,
            formSchema: {
              title: "طلب خدمة تنظيف عميق",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 50,
                  placeholder: "أدخل المساحة المراد تنظيفها"
                },
                {
                  type: "select",
                  label: "نوع المبنى",
                  field: "buildingType",
                  options: [
                    { label: "شقة سكنية", value: "apartment", pricePerM2: 25 },
                    { label: "فيلا", value: "villa", pricePerM2: 30 },
                    { label: "مكتب", value: "office", pricePerM2: 20 },
                    { label: "محل تجاري", value: "shop", pricePerM2: 22 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تعقيم؟",
                  field: "sanitization",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 10
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تنظيف نوافذ خارجية؟",
                  field: "externalWindows",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 15
                }
              ]
            }
          },
          {
            id: 5002,
            name: "صيانة دورية",
            slug: "periodic-maintenance",
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
            description: "برامج صيانة دورية شاملة",
            unit: "عقد شهري",
            basePrice: 500,
            formSchema: {
              title: "طلب صيانة دورية",
              steps: [
                {
                  type: "select",
                  label: "نوع الصيانة",
                  field: "maintenanceType",
                  options: [
                    { label: "صيانة أساسية", value: "basic", pricePerMonth: 500 },
                    { label: "صيانة شاملة", value: "comprehensive", pricePerMonth: 800 },
                    { label: "صيانة متميزة", value: "premium", pricePerMonth: 1200 }
                  ]
                },
                {
                  type: "number",
                  label: "مدة العقد (شهور)",
                  field: "duration",
                  min: 3,
                  placeholder: "أدخل مدة العقد"
                },
                {
                  type: "toggle",
                  label: "هل تشمل قطع الغيار؟",
                  field: "includeParts",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 200
                }
              ]
            }
          },
          {
            id: 5003,
            name: "مكافحة الحشرات",
            slug: "pest-control",
            image: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=600&auto=format&fit=crop",
            description: "خدمات مكافحة الحشرات والقوارض",
            unit: "معالجة",
            basePrice: 350,
            formSchema: {
              title: "طلب مكافحة حشرات",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 50,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "نوع المعالجة",
                  field: "treatmentType",
                  options: [
                    { label: "رش عادي", value: "spray", price: 350 },
                    { label: "جل متقدم", value: "gel", price: 450 },
                    { label: "معالجة متكاملة", value: "integrated", price: 650 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تريد ضمان 6 شهور؟",
                  field: "warranty",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 150
                }
              ]
            }
          }
        ]
      },
      {
        id: 502,
        name: "النقل والتخزين",
        slug: "moving-storage",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
        description: "خدمات النقل والتخزين الآمن",
        services: [
          {
            id: 5004,
            name: "نقل أثاث",
            slug: "furniture-moving",
            image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop",
            description: "خدمة نقل أثاث احترافية وآمنة",
            unit: "شاحنة",
            basePrice: 400,
            formSchema: {
              title: "طلب نقل أثاث",
              steps: [
                {
                  type: "select",
                  label: "حجم الشاحنة",
                  field: "truckSize",
                  options: [
                    { label: "شاحنة صغيرة (1 طن)", value: "small", price: 400 },
                    { label: "شاحنة متوسطة (3 طن)", value: "medium", price: 600 },
                    { label: "شاحنة كبيرة (5 طن)", value: "large", price: 900 }
                  ]
                },
                {
                  type: "number",
                  label: "المسافة (كم)",
                  field: "distance",
                  min: 1,
                  placeholder: "أدخل المسافة"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج عمال تحميل؟",
                  field: "loadingWorkers",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 200
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تغليف؟",
                  field: "packing",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 300
                }
              ]
            }
          },
          {
            id: 5005,
            name: "تخزين أثاث",
            slug: "furniture-storage",
            image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=600&auto=format&fit=crop",
            description: "مستودعات آمنة لتخزين الأثاث",
            unit: "متر مكعب/شهر",
            basePrice: 50,
            formSchema: {
              title: "طلب تخزين أثاث",
              steps: [
                {
                  type: "number",
                  label: "المساحة المطلوبة (م³)",
                  field: "volume",
                  min: 1,
                  placeholder: "أدخل المساحة بالمتر المكعب"
                },
                {
                  type: "number",
                  label: "مدة التخزين (شهور)",
                  field: "duration",
                  min: 1,
                  placeholder: "أدخل مدة التخزين"
                },
                {
                  type: "select",
                  label: "نوع التخزين",
                  field: "storageType",
                  options: [
                    { label: "تخزين عادي", value: "standard", pricePerM3: 50 },
                    { label: "تخزين مكيف", value: "climate-controlled", pricePerM3: 80 },
                    { label: "تخزين VIP", value: "vip", pricePerM3: 120 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تأمين إضافي؟",
                  field: "insurance",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 100
                }
              ]
            }
          }
        ]
      },
      {
        id: 503,
        name: "العزل والحماية",
        slug: "insulation-protection",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
        description: "خدمات العزل الحراري والمائي",
        services: [
          {
            id: 5006,
            name: "عزل مائي",
            slug: "waterproofing",
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
            description: "عزل مائي للأسطح والخزانات",
            unit: "متر مربع",
            basePrice: 65,
            formSchema: {
              title: "طلب عزل مائي",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 10,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "نوع السطح",
                  field: "surfaceType",
                  options: [
                    { label: "سطح خرساني", value: "concrete", pricePerM2: 65 },
                    { label: "سطح معدني", value: "metal", pricePerM2: 75 },
                    { label: "خزان مياه", value: "tank", pricePerM2: 85 }
                  ]
                },
                {
                  type: "select",
                  label: "نوع العزل",
                  field: "insulationType",
                  options: [
                    { label: "عزل بيتوميني", value: "bitumen", priceMultiplier: 1 },
                    { label: "عزل أكريليكي", value: "acrylic", priceMultiplier: 1.3 },
                    { label: "عزل بولي يوريثان", value: "polyurethane", priceMultiplier: 1.5 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج ضمان 10 سنوات؟",
                  field: "warranty10years",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 20
                }
              ]
            }
          },
          {
            id: 5007,
            name: "عزل حراري",
            slug: "thermal-insulation",
            image: "https://images.unsplash.com/photo-1565127752132-8f33d14a9c49?q=80&w=600&auto=format&fit=crop",
            description: "عزل حراري للجدران والأسقف",
            unit: "متر مربع",
            basePrice: 55,
            formSchema: {
              title: "طلب عزل حراري",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 20,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "نوع العزل",
                  field: "insulationType",
                  options: [
                    { label: "فوم بولي يوريثان", value: "foam", pricePerM2: 55 },
                    { label: "ألواح البوليسترين", value: "polystyrene", pricePerM2: 45 },
                    { label: "الصوف الصخري", value: "rockwool", pricePerM2: 65 }
                  ]
                },
                {
                  type: "select",
                  label: "سماكة العزل",
                  field: "thickness",
                  options: [
                    { label: "5 سم", value: "5cm", priceMultiplier: 1 },
                    { label: "7.5 سم", value: "7.5cm", priceMultiplier: 1.3 },
                    { label: "10 سم", value: "10cm", priceMultiplier: 1.6 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج طبقة حماية؟",
                  field: "protectionLayer",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 15
                }
              ]
            }
          },
          {
            id: 5008,
            name: "عزل صوتي",
            slug: "sound-insulation",
            image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?q=80&w=600&auto=format&fit=crop",
            description: "عزل صوتي للغرف والاستوديوهات",
            unit: "متر مربع",
            basePrice: 85,
            formSchema: {
              title: "طلب عزل صوتي",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 10,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "مستوى العزل",
                  field: "insulationLevel",
                  options: [
                    { label: "عزل خفيف", value: "light", pricePerM2: 85 },
                    { label: "عزل متوسط", value: "medium", pricePerM2: 120 },
                    { label: "عزل احترافي", value: "professional", pricePerM2: 180 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج أبواب عازلة؟",
                  field: "soundproofDoors",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 1500
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 6,
    name: "الحدائق والمساحات الخارجية",
    slug: "landscaping",
    image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=1200&auto=format&fit=crop",
    description: "تصميم وتنسيق الحدائق والمساحات الخارجية",
    subcategories: [
      {
        id: 601,
        name: "تنسيق الحدائق",
        slug: "garden-landscaping",
        image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=800&auto=format&fit=crop",
        description: "تنسيق وتصميم الحدائق المنزلية والتجارية",
        services: [
          {
            id: 6001,
            name: "زراعة العشب",
            slug: "lawn-installation",
            image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=600&auto=format&fit=crop",
            description: "زراعة العشب الطبيعي والصناعي",
            unit: "متر مربع",
            basePrice: 35,
            formSchema: {
              title: "طلب زراعة عشب",
              steps: [
                {
                  type: "image-select",
                  label: "نوع العشب",
                  field: "lawnType",
                  options: [
                    { label: "عشب طبيعي", image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?q=80&w=400&auto=format&fit=crop", pricePerM2: 35 },
                    { label: "عشب صناعي", image: "https://images.unsplash.com/photo-1553775282-20af80779df7?q=80&w=400&auto=format&fit=crop", pricePerM2: 85 },
                    { label: "عشب هجين", image: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=400&auto=format&fit=crop", pricePerM2: 120 }
                  ]
                },
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 10,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج نظام ري؟",
                  field: "irrigation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 25
                }
              ]
            }
          },
          {
            id: 6002,
            name: "زراعة الأشجار",
            slug: "tree-planting",
            image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=600&auto=format&fit=crop",
            description: "زراعة الأشجار المثمرة والزينة",
            unit: "شجرة",
            basePrice: 120,
            formSchema: {
              title: "طلب زراعة أشجار",
              steps: [
                {
                  type: "select",
                  label: "نوع الأشجار",
                  field: "treeType",
                  options: [
                    { label: "أشجار زينة", value: "ornamental", pricePerTree: 120 },
                    { label: "أشجار مثمرة", value: "fruit", pricePerTree: 180 },
                    { label: "أشجار ظل", value: "shade", pricePerTree: 250 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد الأشجار",
                  field: "treeCount",
                  min: 1,
                  placeholder: "أدخل عدد الأشجار"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج صيانة دورية؟",
                  field: "maintenance",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 50
                }
              ]
            }
          },
          {
            id: 6003,
            name: "تركيب نوافير",
            slug: "fountains",
            image: "https://images.unsplash.com/photo-1534857574188-2a22e72b1a8e?q=80&w=600&auto=format&fit=crop",
            description: "تركيب وصيانة النوافير والشلالات",
            unit: "نافورة",
            basePrice: 1500,
            formSchema: {
              title: "طلب تركيب نافورة",
              steps: [
                {
                  type: "image-select",
                  label: "نوع النافورة",
                  field: "fountainType",
                  options: [
                    { label: "نافورة صغيرة", image: "https://images.unsplash.com/photo-1534857574188-2a22e72b1a8e?q=80&w=400&auto=format&fit=crop", price: 1500 },
                    { label: "نافورة متوسطة", image: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=400&auto=format&fit=crop", price: 3500 },
                    { label: "شلال مائي", image: "https://images.unsplash.com/photo-1553775282-20af80779df7?q=80&w=400&auto=format&fit=crop", price: 5000 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج إضاءة LED؟",
                  field: "ledLighting",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 800
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تحكم عن بعد؟",
                  field: "remoteControl",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 500
                }
              ]
            }
          }
        ]
      },
      {
        id: 602,
        name: "أثاث خارجي",
        slug: "outdoor-furniture",
        image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop",
        description: "أثاث وإكسسوارات للحدائق والمساحات الخارجية",
        services: [
          {
            id: 6004,
            name: "جلسات خارجية",
            slug: "outdoor-seating",
            image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=600&auto=format&fit=crop",
            description: "جلسات خارجية بتصاميم متنوعة",
            unit: "طقم",
            basePrice: 3500,
            formSchema: {
              title: "طلب جلسات خارجية",
              steps: [
                {
                  type: "image-select",
                  label: "نوع الجلسة",
                  field: "seatingType",
                  options: [
                    { label: "جلسة راتان", image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=400&auto=format&fit=crop", price: 3500 },
                    { label: "جلسة خشبية", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=400&auto=format&fit=crop", price: 4500 },
                    { label: "جلسة ألمنيوم", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=400&auto=format&fit=crop", price: 5800 }
                  ]
                },
                {
                  type: "select",
                  label: "عدد المقاعد",
                  field: "seatsCount",
                  options: [
                    { label: "4 مقاعد", value: "4", priceMultiplier: 1 },
                    { label: "6 مقاعد", value: "6", priceMultiplier: 1.4 },
                    { label: "8 مقاعد", value: "8", priceMultiplier: 1.8 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج مظلة؟",
                  field: "umbrella",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 800
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 7,
    name: "أنظمة الطاقة المتجددة",
    slug: "renewable-energy",
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1200&auto=format&fit=crop",
    description: "أنظمة الطاقة الشمسية والمتجددة للمباني",
    subcategories: [
      {
        id: 701,
        name: "الطاقة الشمسية",
        slug: "solar-energy",
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=800&auto=format&fit=crop",
        description: "أنظمة الطاقة الشمسية للمنازل والمنشآت",
        services: [
          {
            id: 7001,
            name: "ألواح شمسية",
            slug: "solar-panels",
            image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=600&auto=format&fit=crop",
            description: "تركيب ألواح الطاقة الشمسية",
            unit: "كيلوواط",
            basePrice: 1800,
            formSchema: {
              title: "طلب ألواح شمسية",
              steps: [
                {
                  type: "number",
                  label: "القدرة المطلوبة (كيلوواط)",
                  field: "capacity",
                  min: 1,
                  placeholder: "أدخل القدرة المطلوبة"
                },
                {
                  type: "select",
                  label: "نوع النظام",
                  field: "systemType",
                  options: [
                    { label: "متصل بالشبكة", value: "grid-tied", pricePerKW: 1800 },
                    { label: "مستقل مع بطاريات", value: "off-grid", pricePerKW: 2500 },
                    { label: "هجين", value: "hybrid", pricePerKW: 2200 }
                  ]
                },
                {
                  type: "select",
                  label: "جودة الألواح",
                  field: "panelQuality",
                  options: [
                    { label: "اقتصادية", value: "economy", priceMultiplier: 0.8 },
                    { label: "قياسية", value: "standard", priceMultiplier: 1 },
                    { label: "ممتازة", value: "premium", priceMultiplier: 1.3 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج نظام تتبع؟",
                  field: "trackingSystem",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 5000
                }
              ]
            }
          },
          {
            id: 7002,
            name: "سخانات شمسية",
            slug: "solar-heaters",
            image: "https://images.unsplash.com/photo-1521618755572-156ae0cdd74d?q=80&w=600&auto=format&fit=crop",
            description: "سخانات مياه تعمل بالطاقة الشمسية",
            unit: "سخان",
            basePrice: 2500,
            formSchema: {
              title: "طلب سخان شمسي",
              steps: [
                {
                  type: "select",
                  label: "سعة السخان",
                  field: "capacity",
                  options: [
                    { label: "150 لتر", value: "150", price: 2500 },
                    { label: "200 لتر", value: "200", price: 3200 },
                    { label: "300 لتر", value: "300", price: 4500 }
                  ]
                },
                {
                  type: "select",
                  label: "نوع السخان",
                  field: "heaterType",
                  options: [
                    { label: "أنابيب مفرغة", value: "evacuated-tube", priceMultiplier: 1 },
                    { label: "لوح مسطح", value: "flat-plate", priceMultiplier: 1.2 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج سخان كهربائي احتياطي؟",
                  field: "electricBackup",
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
    id: 8,
    name: "المسابح وبرك السباحة",
    slug: "pools-spas",
    image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=1200&auto=format&fit=crop",
    description: "تصميم وإنشاء وصيانة المسابح وبرك السباحة",
    subcategories: [
      {
        id: 801,
        name: "إنشاء المسابح",
        slug: "pool-construction",
        image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=800&auto=format&fit=crop",
        description: "تصميم وإنشاء المسابح بجميع الأنواع",
        services: [
          {
            id: 8001,
            name: "مسبح خرساني",
            slug: "concrete-pool",
            image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=600&auto=format&fit=crop",
            description: "إنشاء مسابح خرسانية مخصصة",
            unit: "متر مربع",
            basePrice: 2000,
            formSchema: {
              title: "طلب إنشاء مسبح خرساني",
              steps: [
                {
                  type: "number",
                  label: "مساحة المسبح (م²)",
                  field: "area",
                  min: 15,
                  placeholder: "أدخل مساحة المسبح"
                },
                {
                  type: "select",
                  label: "عمق المسبح",
                  field: "depth",
                  options: [
                    { label: "1.2 متر", value: "1.2", priceMultiplier: 1 },
                    { label: "1.5 متر", value: "1.5", priceMultiplier: 1.2 },
                    { label: "1.8 متر", value: "1.8", priceMultiplier: 1.4 },
                    { label: "متدرج العمق", value: "variable", priceMultiplier: 1.5 }
                  ]
                },
                {
                  type: "image-select",
                  label: "نوع التشطيب",
                  field: "finish",
                  options: [
                    { label: "سيراميك", image: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=400&auto=format&fit=crop", pricePerM2: 350 },
                    { label: "موزاييك", image: "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?q=80&w=400&auto=format&fit=crop", pricePerM2: 550 },
                    { label: "فسيفساء زجاجية", image: "https://images.unsplash.com/photo-1519293978507-9c6bb9f82eda?q=80&w=400&auto=format&fit=crop", pricePerM2: 750 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج نظام تسخين؟",
                  field: "heatingSystem",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 15000
                },
                {
                  type: "toggle",
                  label: "هل تحتاج إضاءة LED تحت الماء؟",
                  field: "underwaterLighting",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 5000
                }
              ]
            }
          },
          {
            id: 8002,
            name: "مسبح فايبرجلاس",
            slug: "fiberglass-pool",
            image: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=600&auto=format&fit=crop",
            description: "تركيب مسابح فايبرجلاس جاهزة",
            unit: "مسبح",
            basePrice: 35000,
            formSchema: {
              title: "طلب مسبح فايبرجلاس",
              steps: [
                {
                  type: "select",
                  label: "حجم المسبح",
                  field: "poolSize",
                  options: [
                    { label: "صغير (4×2 متر)", value: "small", price: 35000 },
                    { label: "متوسط (6×3 متر)", value: "medium", price: 48000 },
                    { label: "كبير (8×4 متر)", value: "large", price: 65000 }
                  ]
                },
                {
                  type: "select",
                  label: "لون المسبح",
                  field: "poolColor",
                  options: [
                    { label: "أزرق فاتح", value: "light-blue", priceAdd: 0 },
                    { label: "أزرق غامق", value: "dark-blue", priceAdd: 0 },
                    { label: "أبيض", value: "white", priceAdd: 2000 },
                    { label: "رمادي", value: "gray", priceAdd: 2000 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج سلم داخلي؟",
                  field: "internalStairs",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 3000
                }
              ]
            }
          }
        ]
      },
      {
        id: 802,
        name: "صيانة المسابح",
        slug: "pool-maintenance",
        image: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=800&auto=format&fit=crop",
        description: "خدمات صيانة وتنظيف المسابح",
        services: [
          {
            id: 8003,
            name: "صيانة دورية",
            slug: "regular-maintenance",
            image: "https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=600&auto=format&fit=crop",
            description: "خدمة صيانة دورية للمسابح",
            unit: "شهر",
            basePrice: 800,
            formSchema: {
              title: "طلب صيانة دورية للمسبح",
              steps: [
                {
                  type: "number",
                  label: "مساحة المسبح (م²)",
                  field: "area",
                  min: 15,
                  placeholder: "أدخل مساحة المسبح"
                },
                {
                  type: "select",
                  label: "عدد الزيارات",
                  field: "visitsFrequency",
                  options: [
                    { label: "مرة أسبوعياً", value: "weekly", pricePerMonth: 800 },
                    { label: "مرتين أسبوعياً", value: "twice-weekly", pricePerMonth: 1400 },
                    { label: "يومياً", value: "daily", pricePerMonth: 3500 }
                  ]
                },
                {
                  type: "number",
                  label: "مدة العقد (شهور)",
                  field: "duration",
                  min: 1,
                  placeholder: "أدخل مدة العقد"
                },
                {
                  type: "toggle",
                  label: "هل تشمل المواد الكيميائية؟",
                  field: "includeChemicals",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 300
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 9,
    name: "الديكورات والإكسسوارات",
    slug: "decor-accessories",
    image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1200&auto=format&fit=crop",
    description: "ديكورات وإكسسوارات منزلية متنوعة",
    subcategories: [
      {
        id: 901,
        name: "الستائر والمفروشات",
        slug: "curtains-textiles",
        image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=800&auto=format&fit=crop",
        description: "ستائر ومفروشات بتصاميم متنوعة",
        services: [
          {
            id: 9001,
            name: "ستائر مخصصة",
            slug: "custom-curtains",
            image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=600&auto=format&fit=crop",
            description: "تفصيل وتركيب ستائر حسب المقاس",
            unit: "متر مربع",
            basePrice: 120,
            formSchema: {
              title: "طلب ستائر مخصصة",
              steps: [
                {
                  type: "number",
                  label: "العرض (متر)",
                  field: "width",
                  min: 1,
                  placeholder: "أدخل عرض الستارة"
                },
                {
                  type: "number",
                  label: "الارتفاع (متر)",
                  field: "height",
                  min: 1,
                  placeholder: "أدخل ارتفاع الستارة"
                },
                {
                  type: "image-select",
                  label: "نوع القماش",
                  field: "fabricType",
                  options: [
                    { label: "قطن", image: "https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=400&auto=format&fit=crop", pricePerM2: 120 },
                    { label: "حرير", image: "https://images.unsplash.com/photo-1617103996702-96ff29b1c467?q=80&w=400&auto=format&fit=crop", pricePerM2: 280 },
                    { label: "مخمل", image: "https://images.unsplash.com/photo-1615800001964-5afd0ae8e49a?q=80&w=400&auto=format&fit=crop", pricePerM2: 220 }
                  ]
                },
                {
                  type: "select",
                  label: "نوع الستارة",
                  field: "curtainType",
                  options: [
                    { label: "ستارة عادية", value: "regular", priceMultiplier: 1 },
                    { label: "ستارة بليسيه", value: "pleated", priceMultiplier: 1.4 },
                    { label: "ستارة رومانية", value: "roman", priceMultiplier: 1.6 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تركيب؟",
                  field: "installation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 150
                }
              ]
            }
          }
        ]
      },
      {
        id: 902,
        name: "الإضاءة الديكورية",
        slug: "decorative-lighting",
        image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=800&auto=format&fit=crop",
        description: "إضاءة ديكورية للمنازل والمكاتب",
        services: [
          {
            id: 9002,
            name: "ثريات حديثة",
            slug: "modern-chandeliers",
            image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop",
            description: "ثريات بتصاميم عصرية وحديثة",
            unit: "قطعة",
            basePrice: 1200,
            formSchema: {
              title: "طلب ثريات حديثة",
              steps: [
                {
                  type: "image-select",
                  label: "اختر التصميم",
                  field: "designType",
                  options: [
                    { label: "تصميم دائري", image: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=400&auto=format&fit=crop", price: 1200 },
                    { label: "تصميم خطي", image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=400&auto=format&fit=crop", price: 1500 },
                    { label: "تصميم هندسي", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=400&auto=format&fit=crop", price: 1800 }
                  ]
                },
                {
                  type: "select",
                  label: "المادة",
                  field: "material",
                  options: [
                    { label: "كريستال", value: "crystal", priceMultiplier: 1.5 },
                    { label: "معدن", value: "metal", priceMultiplier: 1 },
                    { label: "خشب وزجاج", value: "wood-glass", priceMultiplier: 1.2 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تركيب؟",
                  field: "installation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 250
                }
              ]
            }
          },
          {
            id: 9003,
            name: "مصابيح جدارية",
            slug: "wall-sconces",
            image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop",
            description: "مصابيح جدارية ديكورية",
            unit: "قطعة",
            basePrice: 350,
            formSchema: {
              title: "طلب مصابيح جدارية",
              steps: [
                {
                  type: "image-select",
                  label: "اختر النمط",
                  field: "styleType",
                  options: [
                    { label: "نمط صناعي", image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=400&auto=format&fit=crop", price: 350 },
                    { label: "نمط كلاسيكي", image: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=400&auto=format&fit=crop", price: 450 },
                    { label: "نمط شرقي", image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=400&auto=format&fit=crop", price: 550 }
                  ]
                },
                {
                  type: "number",
                  label: "عدد المصابيح",
                  field: "quantity",
                  min: 1,
                  placeholder: "أدخل عدد المصابيح"
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تركيب؟",
                  field: "installation",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 100
                }
              ]
            }
          }
        ]
      },
      {
        id: 903,
        name: "السجاد والموكيت",
        slug: "carpets-rugs",
        image: "https://images.unsplash.com/photo-1584285418504-004a6b61c54e?q=80&w=800&auto=format&fit=crop",
        description: "سجاد وموكيت بتصاميم متنوعة",
        services: [
          {
            id: 9004,
            name: "سجاد فاخر",
            slug: "luxury-carpets",
            image: "https://images.unsplash.com/photo-1584285418504-004a6b61c54e?q=80&w=600&auto=format&fit=crop",
            description: "سجاد فاخر بتصاميم عصرية وكلاسيكية",
            unit: "متر مربع",
            basePrice: 450,
            formSchema: {
              title: "طلب سجاد فاخر",
              steps: [
                {
                  type: "image-select",
                  label: "اختر النمط",
                  field: "carpetStyle",
                  options: [
                    { label: "نمط فارسي", image: "https://images.unsplash.com/photo-1584285418504-004a6b61c54e?q=80&w=400&auto=format&fit=crop", pricePerM2: 450 },
                    { label: "نمط تركي", image: "https://images.unsplash.com/photo-1594040226829-7f251ab46d80?q=80&w=400&auto=format&fit=crop", pricePerM2: 550 },
                    { label: "نمط مغربي", image: "https://images.unsplash.com/photo-1600607686527-b5a05b5e7803?q=80&w=400&auto=format&fit=crop", pricePerM2: 650 }
                  ]
                },
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 1,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "المادة",
                  field: "material",
                  options: [
                    { label: "صوف طبيعي", value: "wool", priceMultiplier: 1.3 },
                    { label: "حرير", value: "silk", priceMultiplier: 2.5 },
                    { label: "مواد صناعية", value: "synthetic", priceMultiplier: 0.8 }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 10,
    name: "البناء والإنشاءات",
    slug: "construction",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات البناء والإنشاءات للمنازل والمباني",
    subcategories: [
      {
        id: 1001,
        name: "الهيكل الإنشائي",
        slug: "structural-work",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=800&auto=format&fit=crop",
        description: "أعمال الهيكل الإنشائي للمباني",
        services: [
          {
            id: 10001,
            name: "بناء هيكل خرساني",
            slug: "concrete-structure",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
            description: "بناء هيكل خرساني للمباني",
            unit: "متر مربع",
            basePrice: 1200,
            formSchema: {
              title: "طلب بناء هيكل خرساني",
              steps: [
                {
                  type: "number",
                  label: "المساحة الإجمالية (م²)",
                  field: "area",
                  min: 50,
                  placeholder: "أدخل المساحة الإجمالية"
                },
                {
                  type: "select",
                  label: "عدد الطوابق",
                  field: "floors",
                  options: [
                    { label: "طابق واحد", value: 1, priceMultiplier: 1 },
                    { label: "طابقين", value: 2, priceMultiplier: 1.8 },
                    { label: "ثلاثة طوابق", value: 3, priceMultiplier: 2.5 }
                  ]
                },
                {
                  type: "select",
                  label: "نوع الخرسانة",
                  field: "concreteType",
                  options: [
                    { label: "خرسانة عادية", value: "regular", priceMultiplier: 1 },
                    { label: "خرسانة مسلحة عالية المقاومة", value: "high-strength", priceMultiplier: 1.3 },
                    { label: "خرسانة مقاومة للزلازل", value: "earthquake-resistant", priceMultiplier: 1.5 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تصميم هندسي؟",
                  field: "engineeringDesign",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 15000
                }
              ]
            }
          },
          {
            id: 10002,
            name: "بناء بالطوب",
            slug: "brick-construction",
            image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop",
            description: "بناء جدران وهياكل بالطوب",
            unit: "متر مربع",
            basePrice: 350,
            formSchema: {
              title: "طلب بناء بالطوب",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 10,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "نوع الطوب",
                  field: "brickType",
                  options: [
                    { label: "طوب أحمر", value: "red-brick", pricePerM2: 350 },
                    { label: "طوب حراري", value: "thermal-brick", pricePerM2: 450 },
                    { label: "طوب خفيف", value: "light-brick", pricePerM2: 400 }
                  ]
                },
                {
                  type: "select",
                  label: "سماكة الجدار",
                  field: "wallThickness",
                  options: [
                    { label: "10 سم", value: "10cm", priceMultiplier: 0.8 },
                    { label: "20 سم", value: "20cm", priceMultiplier: 1 },
                    { label: "30 سم", value: "30cm", priceMultiplier: 1.4 }
                  ]
                }
              ]
            }
          }
        ]
      },
      {
        id: 1002,
        name: "أعمال الحفر والأساسات",
        slug: "excavation-foundation",
        image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop",
        description: "خدمات الحفر وبناء الأساسات",
        services: [
          {
            id: 10003,
            name: "حفر وتسوية",
            slug: "excavation-leveling",
            image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=600&auto=format&fit=crop",
            description: "أعمال الحفر وتسوية الأرض",
            unit: "متر مكعب",
            basePrice: 80,
            formSchema: {
              title: "طلب حفر وتسوية",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 50,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "number",
                  label: "العمق (متر)",
                  field: "depth",
                  min: 0.5,
                  placeholder: "أدخل العمق"
                },
                {
                  type: "select",
                  label: "نوع التربة",
                  field: "soilType",
                  options: [
                    { label: "تربة رملية", value: "sandy", priceMultiplier: 1 },
                    { label: "تربة طينية", value: "clay", priceMultiplier: 1.2 },
                    { label: "تربة صخرية", value: "rocky", priceMultiplier: 1.8 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج نقل مخلفات الحفر؟",
                  field: "wasteRemoval",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 20
                }
              ]
            }
          },
          {
            id: 10004,
            name: "بناء أساسات",
            slug: "foundation-construction",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
            description: "بناء أساسات للمباني",
            unit: "متر مكعب",
            basePrice: 1500,
            formSchema: {
              title: "طلب بناء أساسات",
              steps: [
                {
                  type: "number",
                  label: "المساحة (م²)",
                  field: "area",
                  min: 50,
                  placeholder: "أدخل المساحة"
                },
                {
                  type: "select",
                  label: "نوع الأساس",
                  field: "foundationType",
                  options: [
                    { label: "أساس شريطي", value: "strip", pricePerM3: 1500 },
                    { label: "أساس منفصل", value: "isolated", pricePerM3: 1800 },
                    { label: "أساس لبشة", value: "raft", pricePerM3: 2200 }
                  ]
                },
                {
                  type: "select",
                  label: "قوة الخرسانة",
                  field: "concreteStrength",
                  options: [
                    { label: "25 ميجا باسكال", value: "25mpa", priceMultiplier: 1 },
                    { label: "30 ميجا باسكال", value: "30mpa", priceMultiplier: 1.15 },
                    { label: "35 ميجا باسكال", value: "35mpa", priceMultiplier: 1.3 }
                  ]
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    id: 11,
    name: "الخدمات الهندسية",
    slug: "engineering-services",
    image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1200&auto=format&fit=crop",
    description: "خدمات هندسية متنوعة للمشاريع",
    subcategories: [
      {
        id: 1101,
        name: "التصميم الهندسي",
        slug: "engineering-design",
        image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=800&auto=format&fit=crop",
        description: "خدمات التصميم الهندسي للمشاريع",
        services: [
          {
            id: 11001,
            name: "تصميم معماري",
            slug: "architectural-design",
            image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop",
            description: "تصميم معماري للمباني والمنشآت",
            unit: "متر مربع",
            basePrice: 120,
            formSchema: {
              title: "طلب تصميم معماري",
              steps: [
                {
                  type: "number",
                  label: "المساحة الإجمالية (م²)",
                  field: "area",
                  min: 100,
                  placeholder: "أدخل المساحة الإجمالية"
                },
                {
                  type: "select",
                  label: "نوع المبنى",
                  field: "buildingType",
                  options: [
                    { label: "سكني", value: "residential", pricePerM2: 120 },
                    { label: "تجاري", value: "commercial", pricePerM2: 150 },
                    { label: "صناعي", value: "industrial", pricePerM2: 100 }
                  ]
                },
                {
                  type: "select",
                  label: "مستوى التفاصيل",
                  field: "detailLevel",
                  options: [
                    { label: "مخططات أساسية", value: "basic", priceMultiplier: 1 },
                    { label: "مخططات تنفيذية", value: "detailed", priceMultiplier: 1.5 },
                    { label: "مخططات كاملة مع تصور ثلاثي الأبعاد", value: "complete-3d", priceMultiplier: 2.2 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج مجسمات ثلاثية الأبعاد؟",
                  field: "3dModels",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 5000
                }
              ]
            }
          },
          {
            id: 11002,
            name: "تصميم إنشائي",
            slug: "structural-design",
            image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
            description: "تصميم إنشائي للمباني",
            unit: "متر مربع",
            basePrice: 80,
            formSchema: {
              title: "طلب تصميم إنشائي",
              steps: [
                {
                  type: "number",
                  label: "المساحة الإجمالية (م²)",
                  field: "area",
                  min: 100,
                  placeholder: "أدخل المساحة الإجمالية"
                },
                {
                  type: "select",
                  label: "عدد الطوابق",
                  field: "floors",
                  options: [
                    { label: "طابق واحد", value: 1, priceMultiplier: 1 },
                    { label: "طابقين", value: 2, priceMultiplier: 1.7 },
                    { label: "ثلاثة طوابق", value: 3, priceMultiplier: 2.3 },
                    { label: "أربعة طوابق أو أكثر", value: 4, priceMultiplier: 3 }
                  ]
                },
                {
                  type: "select",
                  label: "نوع المبنى",
                  field: "buildingType",
                  options: [
                    { label: "سكني", value: "residential", priceMultiplier: 1 },
                    { label: "تجاري", value: "commercial", priceMultiplier: 1.2 },
                    { label: "صناعي", value: "industrial", priceMultiplier: 1.5 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تصميم مقاوم للزلازل؟",
                  field: "earthquakeResistant",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 10000
                }
              ]
            }
          }
        ]
      },
      {
        id: 1102,
        name: "الإشراف الهندسي",
        slug: "engineering-supervision",
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=800&auto=format&fit=crop",
        description: "خدمات الإشراف الهندسي على المشاريع",
        services: [
          {
            id: 11003,
            name: "إشراف هندسي كامل",
            slug: "full-supervision",
            image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop",
            description: "إشراف هندسي كامل على المشاريع",
            unit: "شهر",
            basePrice: 8000,
            formSchema: {
              title: "طلب إشراف هندسي كامل",
              steps: [
                {
                  type: "number",
                  label: "مدة المشروع (شهور)",
                  field: "duration",
                  min: 1,
                  placeholder: "أدخل مدة المشروع"
                },
                {
                  type: "number",
                  label: "مساحة المشروع (م²)",
                  field: "area",
                  min: 100,
                  placeholder: "أدخل مساحة المشروع"
                },
                {
                  type: "select",
                  label: "نوع المشروع",
                  field: "projectType",
                  options: [
                    { label: "سكني", value: "residential", pricePerMonth: 8000 },
                    { label: "تجاري", value: "commercial", pricePerMonth: 12000 },
                    { label: "صناعي", value: "industrial", pricePerMonth: 15000 }
                  ]
                },
                {
                  type: "select",
                  label: "عدد الزيارات الأسبوعية",
                  field: "weeklyVisits",
                  options: [
                    { label: "زيارة واحدة", value: 1, priceMultiplier: 1 },
                    { label: "زيارتين", value: 2, priceMultiplier: 1.5 },
                    { label: "ثلاث زيارات", value: 3, priceMultiplier: 2 },
                    { label: "إشراف يومي", value: 7, priceMultiplier: 3 }
                  ]
                }
              ]
            }
          },
          {
            id: 11004,
            name: "استشارات هندسية",
            slug: "engineering-consultation",
            image: "https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop",
            description: "استشارات هندسية متخصصة",
            unit: "ساعة",
            basePrice: 500,
            formSchema: {
              title: "طلب استشارات هندسية",
              steps: [
                {
                  type: "number",
                  label: "عدد الساعات",
                  field: "hours",
                  min: 1,
                  placeholder: "أدخل عدد الساعات"
                },
                {
                  type: "select",
                  label: "نوع الاستشارة",
                  field: "consultationType",
                  options: [
                    { label: "استشارة معمارية", value: "architectural", pricePerHour: 500 },
                    { label: "استشارة إنشائية", value: "structural", pricePerHour: 600 },
                    { label: "استشارة كهروميكانيكية", value: "mep", pricePerHour: 700 }
                  ]
                },
                {
                  type: "toggle",
                  label: "هل تحتاج تقرير مكتوب؟",
                  field: "writtenReport",
                  yesLabel: "نعم",
                  noLabel: "لا",
                  affectPrice: 1000
                }
              ]
            }
          }
        ]
      }
    ]
  }
];

// Dynamic price calculation helper function
export const calculatePrice = (service, formData) => {
  if (!service || !formData) return 0;
  
  let totalPrice = 0;
  const schema = service.formSchema;
  
  // Initialize with base price if no specific pricing is found
  let basePriceApplied = false;
  
  // Process each step in the form schema
  schema.steps.forEach(step => {
    const value = formData[step.field];
    if (value === undefined || value === null) return;
    
    switch(step.type) {
      case 'image-select':
        const selectedOption = step.options.find(opt => opt.label === value);
        if (selectedOption) {
          // Handle all possible price properties dynamically
          Object.keys(selectedOption).forEach(key => {
            if (key.startsWith('price')) {
              if (key === 'price') {
                totalPrice += selectedOption.price;
                basePriceApplied = true;
              } else if (key === 'pricePerM2' && formData.area) {
                totalPrice = selectedOption.pricePerM2 * formData.area;
                basePriceApplied = true;
              } else if (key === 'pricePerRoll' && formData.rolls) {
                totalPrice = selectedOption.pricePerRoll * formData.rolls;
                basePriceApplied = true;
              } else if (key === 'pricePerUnit' && formData.points) {
                totalPrice = selectedOption.pricePerUnit * formData.points;
                basePriceApplied = true;
              } else if (key === 'pricePerCamera' && formData.cameras) {
                totalPrice = selectedOption.pricePerCamera * formData.cameras;
                basePriceApplied = true;
              } else if (key === 'pricePerTree' && formData.treeCount) {
                totalPrice = selectedOption.pricePerTree * formData.treeCount;
                basePriceApplied = true;
              } else if (key === 'pricePerM3' && formData.area && formData.depth) {
                totalPrice = selectedOption.pricePerM3 * formData.area * formData.depth;
                basePriceApplied = true;
              } else if (key === 'pricePerHour' && formData.hours) {
                totalPrice = selectedOption.pricePerHour * formData.hours;
                basePriceApplied = true;
              } else if (key === 'pricePerMonth' && formData.duration) {
                totalPrice = selectedOption.pricePerMonth * formData.duration;
                basePriceApplied = true;
              } else if (key === 'priceAdd') {
                totalPrice += selectedOption.priceAdd;
              } else if (key === 'priceKW' && formData.capacity) {
                totalPrice = selectedOption.priceKW * formData.capacity;
                basePriceApplied = true;
              }
            }
          });
        }
        break;
        
      case 'number':
        // Handle different number field types
        if (step.field === 'area' && !basePriceApplied) {
          // For area-based pricing
          totalPrice = service.basePrice * (value || 1);
          basePriceApplied = true;
        } else if (step.field === 'quantity' && !basePriceApplied) {
          // For quantity-based items
          totalPrice = service.basePrice * (value || 1);
          basePriceApplied = true;
        } else if (step.field === 'width' && step.field === 'height') {
          // For width x height calculations (like curtains)
          const width = formData.width || 1;
          const height = formData.height || 1;
          const area = width * height;
          
          // Find if there's a fabric type with pricePerM2
          const fabricStep = schema.steps.find(s => s.field === 'fabricType');
          if (fabricStep) {
            const selectedFabric = fabricStep.options.find(opt => opt.label === formData.fabricType);
            if (selectedFabric && selectedFabric.pricePerM2) {
              totalPrice = selectedFabric.pricePerM2 * area;
              basePriceApplied = true;
            }
          }
        } else if (step.field === 'hours' && !basePriceApplied) {
          // For hourly services
          const consultationStep = schema.steps.find(s => s.field === 'consultationType');
          if (consultationStep) {
            const selectedType = consultationStep.options.find(opt => opt.value === formData.consultationType);
            if (selectedType && selectedType.pricePerHour) {
              totalPrice = selectedType.pricePerHour * value;
              basePriceApplied = true;
            } else {
              totalPrice = service.basePrice * value;
              basePriceApplied = true;
            }
          }
        } else if (step.field === 'depth' && formData.area && !basePriceApplied) {
          // For volume calculations (area * depth)
          const soilStep = schema.steps.find(s => s.field === 'soilType');
          if (soilStep) {
            const selectedSoil = soilStep.options.find(opt => opt.value === formData.soilType);
            const baseVolumePrice = service.basePrice * formData.area * value;
            if (selectedSoil && selectedSoil.priceMultiplier) {
              totalPrice = baseVolumePrice * selectedSoil.priceMultiplier;
            } else {
              totalPrice = baseVolumePrice;
            }
            basePriceApplied = true;
          }
        }
        break;
        
      case 'toggle':
        if (value === true && step.affectPrice) {
          // Dynamically determine what to multiply the affectPrice by
          let multiplier = 1;
          
          // Common multiplier fields
          const multiplierFields = {
            'area': formData.area,
            'rolls': formData.rolls,
            'points': formData.points,
            'cameras': formData.cameras,
            'rooms': formData.rooms,
            'windows': formData.windows,
            'locks': formData.locks,
            'sensors': formData.sensors,
            'units': formData.units,
            'treeCount': formData.treeCount
          };
          
          // Find the appropriate multiplier based on the toggle field and available form data
          Object.keys(multiplierFields).forEach(field => {
            if (multiplierFields[field] && 
                (step.field === 'installation' || 
                 step.field.includes(field) || 
                 service.unit.includes(field.replace('Count', '')))) {
              multiplier = multiplierFields[field];
            }
          });
          
          totalPrice += step.affectPrice * multiplier;
        }
        break;
        
      case 'select':
        const selected = step.options.find(opt => opt.value === value || opt.label === value);
        if (selected) {
          // Handle price multipliers
          if (selected.priceMultiplier) {
            totalPrice = totalPrice * selected.priceMultiplier;
          }
          
          // Handle different price types
          Object.keys(selected).forEach(key => {
            if (key.startsWith('price')) {
              if (key === 'price' && !basePriceApplied) {
                totalPrice = selected.price;
                basePriceApplied = true;
              } else if (key === 'priceAdd') {
                if (formData.area) {
                  totalPrice += selected.priceAdd * formData.area;
                } else {
                  totalPrice += selected.priceAdd;
                }
              } else if (key === 'pricePerM2' && formData.area) {
                totalPrice = selected.pricePerM2 * formData.area;
                basePriceApplied = true;
              } else if (key === 'pricePerM3' && formData.volume) {
                let volumeMultiplier = formData.duration || 1;
                totalPrice = selected.pricePerM3 * formData.volume * volumeMultiplier;
                basePriceApplied = true;
              } else if (key === 'pricePerMonth' && formData.duration) {
                totalPrice = selected.pricePerMonth * formData.duration;
                basePriceApplied = true;
              } else if (key === 'pricePerHour' && formData.hours) {
                totalPrice = selected.pricePerHour * formData.hours;
                basePriceApplied = true;
              } else if (key === 'pricePerRoom' && formData.rooms) {
                totalPrice = selected.pricePerRoom * formData.rooms;
                basePriceApplied = true;
              } else if (key === 'pricePerWindow' && formData.windows) {
                totalPrice = selected.pricePerWindow * formData.windows;
                basePriceApplied = true;
              } else if (key === 'pricePerLock' && formData.locks) {
                totalPrice = selected.pricePerLock * formData.locks;
                basePriceApplied = true;
              } else if (key === 'pricePerKW' && formData.capacity) {
                totalPrice = selected.pricePerKW * formData.capacity;
                basePriceApplied = true;
              }
            }
          });
        }
        break;
        
      case 'color-picker':
        // Color picker doesn't affect price directly
        break;
        
      default:
        break;
    }
  });
  
  // If no price calculated yet, use base price
  if (totalPrice === 0 || !basePriceApplied) {
    // Apply base price with quantity if available
    if (formData.quantity) {
      totalPrice = service.basePrice * formData.quantity;
    } else {
      totalPrice = service.basePrice;
    }
  }
  
  return Math.round(totalPrice);
}; 