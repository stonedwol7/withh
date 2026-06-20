-- ============================================================
-- WITHH.ME — KYC & Partner Onboarding
-- ============================================================

-- KYC enum
create type public.kyc_status as enum ('pending', 'submitted', 'verified', 'rejected');

-- Extend partners_meta
alter table public.partners_meta
  add column if not exists kyc_status public.kyc_status not null default 'pending',
  add column if not exists aadhaar_url text,
  add column if not exists pan_url text,
  add column if not exists selfie_url text,
  add column if not exists address_proof_url text,
  add column if not exists pan_number text,
  add column if not exists bank_account_number text,
  add column if not exists ifsc_code text,
  add column if not exists upi_id text,
  add column if not exists guarantor_name text,
  add column if not exists guarantor_phone text,
  add column if not exists terms_accepted boolean not null default false,
  add column if not exists service_radius_km integer not null default 5,
  add column if not exists rejection_reason text;

-- Create storage bucket for KYC documents
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kyc_docs',
  'kyc_docs',
  false,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do nothing;

-- Storage policy: partners can upload/read their own KYC docs
create policy "Partners can upload their own KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc_docs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Partners can read their own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc_docs'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins can read all KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc_docs'
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
