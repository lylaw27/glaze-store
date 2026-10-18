"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { SlidersHorizontal } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

import { ProductWithParsedFields } from "@/types/product"

interface CategoriesList {
  [type: string]: Array<{ handle: string; name: string }>;
}

export default function CollectionGrid(
  {
    categoriesList,
    allProducts, 
    pageCount,
    page,
    pathname}:
  {
    categoriesList: CategoriesList,
    allProducts: ProductWithParsedFields[],
    pageCount: number, 
    page: number
    pathname:string
  }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedCats, setSelectedCats] = useState<string[]>(() => searchParams.getAll("category"))
  const [priceRange, setPriceRange] = useState<[number, number]>(() => [
    Number(searchParams.get("lowPrice") ?? 0),
    Number(searchParams.get("highPrice") ?? 300),
  ])
  const [sort, setSort] = useState<"featured" | "price-asc" | "price-desc">(() => {
    const value = searchParams.get("sort");
    return value === "price-asc" || value === "price-desc" ? value : "featured";
  })
  const sectionRef = useRef<HTMLElement>(null);
  const activeCategoryHandles = searchParams.getAll("category");
  const activeCategoryNames = Object.values(categoriesList)
    .flat()
    .filter((category) => activeCategoryHandles.includes(category.handle))
    .map((category) => category.name);
  const title = activeCategoryNames.length > 0 ? activeCategoryNames.join("、") : "全部商品";

  // Helper to build URL with page number while preserving other params
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNum.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Scroll to top of section when page changes
  useEffect(() => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  const toggleCat = (handle: string) => {
    setSelectedCats((prev) => (prev.includes(handle) ? prev.filter((t) => t !== handle) : [...prev, handle]))
  }

  const applyFilter = (nextSort: typeof sort = sort) => {
    const params = new URLSearchParams();
    selectedCats.forEach((category) => params.append("category", category));

    if (nextSort !== "featured") params.set("sort", nextSort);
    if (priceRange[0] !== 0 || priceRange[1] !== 300) {
      params.set("lowPrice", priceRange[0].toString());
      params.set("highPrice", priceRange[1].toString());
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const currency = (n: number) =>
    new Intl.NumberFormat("zh-HK", { style: "currency", currency: "HKD", minimumFractionDigits: 2 }).format(n)

  return (
    <section ref={sectionRef} className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">主頁</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <h2 className="mb-8 font-serif text-lg font-normal text-foreground sm:text-xl">{title}</h2>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <button className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.15em] uppercase text-foreground hover:opacity-60 transition-opacity">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.25} />
              篩選條件 +
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[92vw] sm:w-[420px]">
            <SheetHeader>
              <SheetTitle className="font-serif text-xl font-normal">篩選條件</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-8 px-6">
              {/* Categories */}
              {Object.entries(categoriesList).map(([type, categories]) => (
                <div key={type}>
                  <div className="mb-3 font-serif italic text-base text-foreground">{type}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {categories.map(({ handle, name }) => (
                      <label
                        key={handle}
                        className="flex items-center gap-3 border border-border p-3 hover:bg-muted cursor-pointer transition-colors"
                      >
                        <Checkbox checked={selectedCats.includes(handle)} onCheckedChange={() => toggleCat(handle)} />
                        <span className="text-sm">{name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {/* Price */}
              <div>
                <div className="mb-3 font-serif italic text-base text-foreground">價格範圍</div>
                <div className="px-1">
                  <Slider
                    value={priceRange}
                    onValueChange={(v) => setPriceRange([v[0] as number, v[1] as number])}
                    min={0}
                    max={300}
                    step={20}
                    minStepsBetweenThumbs={1}
                  />
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                    <span>{currency(priceRange[0])}</span>
                    <span>{currency(priceRange[1])}</span>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="mt-8 gap-3">
              <Button variant="ghost" onClick={() => (setSelectedCats([]), setPriceRange([0, 300]), setSort("featured"), router.push(pathname, { scroll: false }))}>
                重設
              </Button>
              <SheetClose asChild>
                <Button className="ml-auto" onClick={() => applyFilter()}>套用</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <Label htmlFor="sort" className="text-xs tracking-[0.15em] uppercase text-muted-foreground hidden sm:inline">
            排序
          </Label>
          <Select
            value={sort}
            onValueChange={(v) => {
              const nextSort = v as typeof sort;
              setSort(nextSort);
              applyFilter(nextSort);
            }}
          >
            <SelectTrigger id="sort" className="w-auto gap-2 border-0 shadow-none px-0 text-xs tracking-[0.15em] uppercase focus-visible:ring-0">
              <SelectValue placeholder="精選" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">精選</SelectItem>
              <SelectItem value="price-asc">價格：低到高</SelectItem>
              <SelectItem value="price-desc">價格：高到低</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 sm:gap-x-6">
        {allProducts.map((p: ProductWithParsedFields) => (
          <Link
            key={p.id}
            href={"/products/"+ p.handle}
            className="group"
          >
            <div className="relative aspect-[4/5] bg-muted overflow-hidden">
              <Image
                src={p.images[0] || "/placeholder.svg?height=600&width=600&query=product%20image"}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1023px) 50vw, (max-width: 1280px) 25vw, 286px"
              />
            </div>
            <div className="pt-3">
              <h3 className="font-serif text-base text-foreground line-clamp-1">{p.name}</h3>
              <div className="mt-1 text-sm text-muted-foreground">{currency(p.price)} 起</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-10 flex items-center justify-center gap-1 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          // onClick={() => setPage((p) => Math.max(1, p - 1))}
          aria-label="上一頁"
          asChild
          className={page === 1 ? "hidden" : ""}
        >
          <Link href={buildPageUrl(page - 1)} scroll={false}>
            上一頁
          </Link>
        </Button>
        {Array.from({ length: pageCount }).map((_, i) => {
          const n = i + 1
          const active = page === n
          // collapse long ranges with simple strategy for small screens
          if (pageCount > 6) {
            if (n !== 1 && n !== pageCount && Math.abs(n - page) > 1) {
              if (n === 2 || n === pageCount - 1) {
                return (
                  <span key={n} className="px-2 text-gray-400">
                    ...
                  </span>
                )
              }
              return null
            }
          }
          return (
            <Button
              key={n}
              variant={active ? "default" : "outline"}
              size="sm"
              aria-current={active ? "page" : undefined}
              className="min-w-9"
              asChild
            >
              <Link href={buildPageUrl(n)} scroll={false}>
                {n}
              </Link>
            </Button>
          )
        })}
        <Button
          variant="outline"
          size="sm"
          className={page === pageCount ? "hidden" : ""}
          aria-label="下一頁"
          asChild
        >
          <Link href={buildPageUrl(page + 1)} scroll={false}>
            下一頁
          </Link>
        </Button>
      </div>

    </section>
  )
}
