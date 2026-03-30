"""
One-time script to import Book1.xlsx into Supabase.

Usage:
  pip install pandas openpyxl supabase
  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=your-service-key python scripts/import_excel.py
"""

import os
import sys
import pandas as pd
from datetime import datetime

try:
    from supabase import create_client
except ImportError:
    print("Install dependencies first: pip install pandas openpyxl supabase")
    sys.exit(1)

SUPABASE_URL        = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.")
    sys.exit(1)

client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

EXCEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'Book1.xlsx')
df = pd.read_excel(EXCEL_PATH)

df.columns = [
    'atoll', 'island', 'constituency', 'requested_by', 'requested_date',
    'type', 'position', 'hired_location', 'division', 'candidate_name',
    'id_card', 'candidate_contact', 'status', 'recruitment_stage',
    'joined_date', 'remarks', 'assigned_to', 'salary'
]

VALID_STATUS = {'Pending', 'Active', 'Rejected', 'Withdrawn', 'Completed'}
VALID_STAGE  = {'Interview', 'Approval', 'Offer', 'Onboarding', 'Closed'}
VALID_TYPE   = {'New', 'Replacement', 'Contract'}

def parse_date(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.strftime('%Y-%m-%d')
    try:
        return pd.to_datetime(str(val), dayfirst=True).strftime('%Y-%m-%d')
    except Exception:
        return None

def clean_str(val):
    if pd.isna(val):
        return None
    return str(val).strip()

records = []
for _, row in df.iterrows():
    raw_status = clean_str(row['status']) or 'Pending'
    raw_stage  = clean_str(row['recruitment_stage'])
    raw_type   = clean_str(row['type']) or 'New'

    records.append({
        'atoll':             clean_str(row['atoll']),
        'island':            clean_str(row['island']),
        'constituency':      clean_str(row['constituency']),
        'requested_by':      clean_str(row['requested_by']),
        'requested_date':    parse_date(row['requested_date']),
        'type':              raw_type   if raw_type   in VALID_TYPE   else 'New',
        'position':          clean_str(row['position']),
        'hired_location':    clean_str(row['hired_location']),
        'division':          clean_str(row['division']),
        'candidate_name':    clean_str(row['candidate_name']),
        'id_card':           clean_str(row['id_card']),
        'candidate_contact': str(int(row['candidate_contact'])) if pd.notna(row['candidate_contact']) else None,
        'status':            raw_status if raw_status in VALID_STATUS else 'Pending',
        'recruitment_stage': raw_stage  if raw_stage  in VALID_STAGE  else None,
        'joined_date':       parse_date(row['joined_date']),
        'remarks':           clean_str(row['remarks']),
        'assigned_to':       clean_str(row['assigned_to']),
        'salary':            int(row['salary']) if pd.notna(row['salary']) else None,
    })

result = client.table('recruitment').insert(records).execute()
print(f"Imported {len(result.data)} records successfully.")
