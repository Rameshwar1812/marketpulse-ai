import csv
import os

def split():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    input_path = os.path.join(base_dir, "dsld_market_catalog.csv")
    output_dir = os.path.join(base_dir, "dsld_parts")
    
    if not os.path.exists(input_path):
        print(f"Error: Could not find base catalog file at: {input_path}")
        return

    os.makedirs(output_dir, exist_ok=True)
    
    with open(input_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        
        rows = list(reader)
        total_rows = len(rows)
        chunk_size = 100
        
        for i in range(0, total_rows, chunk_size):
            chunk = rows[i : i + chunk_size]
            part_num = (i // chunk_size) + 1
            part_path = os.path.join(output_dir, f"dsld_market_catalog_part{part_num}.csv")
            
            with open(part_path, "w", newline="", encoding="utf-8") as out_f:
                writer = csv.writer(out_f)
                writer.writerow(header)
                writer.writerows(chunk)
                
            print(f"Generated: dsld_parts/dsld_market_catalog_part{part_num}.csv ({len(chunk)} rows)")

if __name__ == "__main__":
    split()
