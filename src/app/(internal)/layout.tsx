import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InternalSidebar } from "@/components/layout/internal-sidebar";
import { Separator } from "@/components/ui/separator";

export default function InternalLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider defaultOpen={true}>
			{/* 1. Left Sidebar Component */}
			<InternalSidebar />

			{/* 2. Main Content Area */}
			<SidebarInset className="flex flex-1 flex-col bg-background">
				
				{/* TOP: Slim Toolbar */}
				<header className="sticky top-0 z-30 flex h-14 shrink-0 justify-between items-center bg-background/80 px-4 backdrop-blur-md border-b border-border/40 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
					<div className="flex items-center gap-2">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="h-4 mx-2" />
						<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-4">
							Admin
						</span>
					</div>
				</header>

				{/* CONTENT */}
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
					<div className="mx-auto w-full max-w-7xl">
						{children}
					</div>
				</main>

			</SidebarInset>
		</SidebarProvider>
	);
}
