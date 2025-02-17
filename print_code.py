import os
import pathlib

def print_codebase_to_file(root_dir, output_file):
    root_dir = str(root_dir)
    
    def should_include_file(file_path):
        # Only include HTML files in root directory
        if os.path.dirname(file_path) == root_dir:
            return file_path.lower().endswith('.html')
        # Only include CSS files in css directory
        if os.path.dirname(file_path) == os.path.join(root_dir, 'assets', 'css'):
            return file_path.lower().endswith('.css')
        # Include js files in js directory
        if os.path.dirname(file_path) == os.path.join(root_dir, 'assets', 'js'):
            return file_path.lower().endswith('.js')
        return False

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("Directory Structure:\n")
        f.write("===================\n\n")
        
        # Modified directory structure printing
        for root, dirs, files in os.walk(root_dir):
            level = root.replace(root_dir, '').count(os.sep)
            indent = '  ' * level
            rel_path = os.path.relpath(root, root_dir)
            
            # Only show root directory and css directory
            if rel_path == '.' or rel_path == os.path.join('assets', 'css'):
                f.write(f"{indent}{os.path.basename(root) if rel_path != '.' else 'root'}/\n")
                subindent = '  ' * (level + 1)
                for file in files:
                    file_path = os.path.join(root, file)
                    if should_include_file(file_path):
                        f.write(f"{subindent}{file}\n")
        
        f.write("\n\nFile Contents:\n")
        f.write("=============\n\n")
        
        # Modified file content printing
        for root, dirs, files in os.walk(root_dir):
            for file in files:
                file_path = os.path.join(root, file)
                if should_include_file(file_path):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as source_file:
                            f.write(f"\n{'='*80}\n")
                            f.write(f"File: {file_path}\n")
                            f.write(f"{'='*80}\n\n")
                            f.write(source_file.read())
                            f.write("\n")
                    except Exception as e:
                        f.write(f"Could not read file {file_path}: {str(e)}\n")

if __name__ == "__main__":
    # Get the current directory where the script is located
    current_dir = pathlib.Path(__file__).parent.absolute()
    output_file = os.path.join(current_dir, "codebase_structure.txt")
    print_codebase_to_file(current_dir, output_file)
    print(f"Codebase structure and contents have been written to {output_file}")
