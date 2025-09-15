import { Header } from '@/components/header'
import { ProductTable } from '@/components/Table/ProductTable'
export default async function Home() {
  return (
    <div className="py-4">
      <Header />
      <ProductTable />
      <main></main>
    </div>
  )
}