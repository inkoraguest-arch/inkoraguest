-- Create a new storage bucket for portfolio and profile images
insert into storage.buckets (id, name, public)
values ('portfolios', 'portfolios', true)
on conflict (id) do nothing;

-- Set up sharing policies for the bucket
-- Allow public access to read files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'portfolios' );

-- Allow authenticated users to upload files
create policy "Auth Upload"
on storage.objects for insert
with check ( auth.role() = 'authenticated' AND bucket_id = 'portfolios' );

-- Allow users to update and delete their own files
create policy "Users can update their own files"
on storage.objects for update
using ( auth.uid() = owner AND bucket_id = 'portfolios' );

create policy "Users can delete their own files"
on storage.objects for delete
using ( auth.uid() = owner AND bucket_id = 'portfolios' );
