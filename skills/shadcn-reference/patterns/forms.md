# shadcn/ui Form Patterns

## Setup
```bash
npx shadcn@latest add form
```
Installs: `react-hook-form`, `@hookform/resolvers`, `zod`

## Core Pattern: React Hook Form + Zod

### Schema Definition
```tsx
import { z } from "zod"

const formSchema = z.object({
  username: z.string().min(2, "Username must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(160).optional(),
  role: z.enum(["admin", "user", "editor"]),
  notifications: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>
```

### Form Component
```tsx
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function ProfileForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      bio: "",
      notifications: false,
    },
  })

  function onSubmit(values: FormValues) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="johndoe" {...field} />
              </FormControl>
              <FormDescription>Your public display name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

## FormField Composition

### Component Hierarchy
```
<Form>                    ← FormProvider from react-hook-form
  <FormField>             ← Controller wrapper
    <FormItem>            ← Container div with id context
      <FormLabel>         ← Label linked via htmlFor
      <FormControl>       ← Slot connecting aria attributes
        <Input />         ← Any input component
      </FormControl>
      <FormDescription>   ← Help text (aria-describedby)
      <FormMessage>       ← Error message (aria-describedby)
    </FormItem>
  </FormField>
</Form>
```

### Field Type Examples

#### Select
```tsx
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Checkbox
```tsx
<FormField
  control={form.control}
  name="notifications"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Enable notifications</FormLabel>
        <FormDescription>Receive email notifications.</FormDescription>
      </div>
    </FormItem>
  )}
/>
```

#### Textarea
```tsx
<FormField
  control={form.control}
  name="bio"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Bio</FormLabel>
      <FormControl>
        <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
      </FormControl>
      <FormDescription>Max 160 characters.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### RadioGroup
```tsx
<FormField
  control={form.control}
  name="type"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Notification type</FormLabel>
      <FormControl>
        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl><RadioGroupItem value="all" /></FormControl>
            <FormLabel className="font-normal">All notifications</FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl><RadioGroupItem value="mentions" /></FormControl>
            <FormLabel className="font-normal">Mentions only</FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### DatePicker
```tsx
<FormField
  control={form.control}
  name="dob"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Date of birth</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline" className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date > new Date()} initialFocus />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

#### Combobox
```tsx
<FormField
  control={form.control}
  name="language"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Language</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline" role="combobox" className={cn("w-[200px] justify-between", !field.value && "text-muted-foreground")}>
              {field.value ? languages.find((l) => l.value === field.value)?.label : "Select language"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search language..." />
            <CommandList>
              <CommandEmpty>No language found.</CommandEmpty>
              <CommandGroup>
                {languages.map((language) => (
                  <CommandItem value={language.label} key={language.value} onSelect={() => form.setValue("language", language.value)}>
                    <Check className={cn("mr-2 h-4 w-4", language.value === field.value ? "opacity-100" : "opacity-0")} />
                    {language.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Validation Patterns

### Common Zod Schemas
```ts
// Required string
z.string().min(1, "Required")

// Email
z.string().email()

// Number with range
z.coerce.number().min(0).max(100)

// URL
z.string().url()

// Enum
z.enum(["option1", "option2"])

// Array of items (min 1)
z.array(z.string()).min(1, "Select at least one")

// Conditional
z.discriminatedUnion("type", [
  z.object({ type: z.literal("email"), email: z.string().email() }),
  z.object({ type: z.literal("phone"), phone: z.string().min(10) }),
])

// Refine (custom validation)
z.object({
  password: z.string().min(8),
  confirm: z.string(),
}).refine((data) => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ["confirm"],
})
```

### Server-Side Validation
```tsx
async function onSubmit(values: FormValues) {
  const result = await createUser(values)
  if (result.error) {
    // Set server errors on specific fields
    form.setError("email", { message: result.error.email })
    // Or set root error
    form.setError("root", { message: "Something went wrong" })
    return
  }
}
```
