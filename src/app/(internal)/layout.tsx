import { InternalHeader } from "@/components/layout/internal-header";
import { InternalSidebar } from "@/components/layout/internal-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

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
				{/* TOP: SaaS Dashboard Header */}
				<InternalHeader />

				{/* CONTENT */}
				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
					<div className="mx-auto w-full max-w-7xl">{children}</div>
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
