export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className='min-h-full flex flex-col'>{children}</main>;
}
