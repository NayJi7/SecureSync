import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function HomePage({ children }: { children?: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-auto">
        <div className="w-full flex justify-between items-center">
          <div className="container p-4 flex gap-4">
            <SidebarTrigger />
            {children}

            <Breadcrumb className="mt-1">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/components">Components</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="p-4 flex gap-4 w-min">
            <Avatar>
              <AvatarImage src="https://lh3.googleusercontent.com/ogw/AF2bZyhd184Wz5LlpcbpEbmK8TIg73_K9X5kKiP_EvFsDVHit4Gj=s32-c-mo" />
              <AvatarFallback className="bg-gray-300">AT</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="px-5"><Separator /></div>

      </main>
    </SidebarProvider>
  )
}
