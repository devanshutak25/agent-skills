# shadcn/ui Feedback Patterns

## Sonner (Toast)

### Setup
```bash
npx shadcn@latest add sonner
```

Add `<Toaster />` to your root layout:
```tsx
import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
```

### Toast API
```tsx
import { toast } from "sonner"

// Basic
toast("Event has been created")

// With description
toast("Event created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
})

// Success
toast.success("Successfully saved!")

// Error
toast.error("Something went wrong")

// Warning
toast.warning("Please check your input")

// Info
toast.info("Tip: You can drag to reorder")

// Promise
toast.promise(saveData(), {
  loading: "Saving...",
  success: "Data saved!",
  error: "Could not save data",
})

// Action button
toast("File deleted", {
  action: {
    label: "Undo",
    onClick: () => restoreFile(),
  },
})

// Custom JSX
toast.custom((t) => (
  <div className="flex items-center gap-2 rounded-md bg-background p-4 shadow-lg">
    <span>Custom toast</span>
    <Button size="sm" onClick={() => toast.dismiss(t)}>Close</Button>
  </div>
))

// Dismiss
const toastId = toast("Loading...")
toast.dismiss(toastId)

// Duration
toast("Quick message", { duration: 2000 })

// Persistent (no auto-dismiss)
toast("Action required", { duration: Infinity })
```

### Toaster Props
```tsx
<Toaster
  position="bottom-right"   // "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center"
  richColors               // Enhanced color styling
  expand                   // Expanded by default
  closeButton             // Show close button
  theme="system"          // "light" | "dark" | "system"
/>
```

## Dialog

### Basic Dialog
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <Input id="name" defaultValue="Pedro" />
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Controlled Dialog
```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    {/* ... */}
    <Button onClick={() => { handleSave(); setOpen(false) }}>Save</Button>
  </DialogContent>
</Dialog>
```

## Alert Dialog (Confirmation)
```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## Sheet (Side Panel)
```tsx
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open</Button>
  </SheetTrigger>
  <SheetContent side="right">  {/* "top" | "bottom" | "left" | "right" */}
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>Make changes to your profile.</SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">{/* content */}</div>
    <SheetFooter>
      <SheetClose asChild>
        <Button type="submit">Save changes</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

## Alert (Inline)
```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Terminal } from "lucide-react"

// Default
<Alert>
  <Terminal className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>You can add components to your app using the CLI.</AlertDescription>
</Alert>

// Destructive
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
</Alert>
```

## Drawer (Bottom Sheet)
```tsx
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"

<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Move Goal</DrawerTitle>
      <DrawerDescription>Set your daily activity goal.</DrawerDescription>
    </DrawerHeader>
    <div className="p-4">{/* content */}</div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>
```

### Responsive Dialog/Drawer
```tsx
// Desktop: Dialog, Mobile: Drawer
import { useMediaQuery } from "@/hooks/use-media-query"

export function ResponsiveDialog({ children, ...props }) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return <Dialog {...props}>{children}</Dialog>
  }

  return <Drawer {...props}>{children}</Drawer>
}
```
