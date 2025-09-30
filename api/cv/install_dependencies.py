#!/usr/bin/env python3
"""
Dependency Installation Script for CV Model Backend
Handles Python 3.13 compatibility issues and provides alternative installation methods
"""

import subprocess
import sys
import os
import platform

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_python_version():
    """Check Python version and provide warnings"""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version.major == 3 and version.minor >= 13:
        print("⚠️  Python 3.13+ detected. Some packages may have compatibility issues.")
        print("   Using alternative installation methods...")
        return "3.13+"
    elif version.major == 3 and version.minor >= 8:
        print("✅ Python version is compatible")
        return "3.8-3.12"
    else:
        print("❌ Python 3.8+ is required")
        return "incompatible"

def install_build_tools():
    """Install build tools first"""
    commands = [
        ("pip install --upgrade pip", "Upgrading pip"),
        ("pip install setuptools wheel", "Installing build tools"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def install_core_dependencies():
    """Install core dependencies"""
    core_packages = [
        "fastapi",
        "uvicorn[standard]",
        "pydantic",
        "python-socketio",
        "python-multipart",
        "python-dotenv",
        "requests",
        "aiofiles"
    ]
    
    for package in core_packages:
        command = f"pip install {package}"
        if not run_command(command, f"Installing {package}"):
            print(f"⚠️  Failed to install {package}, trying alternative method...")
            # Try without version constraints
            alt_command = f"pip install {package.split('[')[0]}"
            if not run_command(alt_command, f"Installing {package} (alternative)"):
                return False
    return True

def install_cv_dependencies():
    """Install computer vision dependencies with fallbacks"""
    cv_packages = [
        ("opencv-python", "OpenCV"),
        ("ultralytics", "Ultralytics YOLO"),
        ("numpy", "NumPy")
    ]
    
    for package, name in cv_packages:
        command = f"pip install {package}"
        if not run_command(command, f"Installing {name}"):
            print(f"⚠️  Failed to install {name}, trying alternative...")
            
            # Alternative installation methods
            if package == "opencv-python":
                alt_commands = [
                    "pip install opencv-python-headless",
                    "pip install opencv-contrib-python"
                ]
            elif package == "ultralytics":
                alt_commands = [
                    "pip install ultralytics --no-deps",
                    "pip install torch torchvision"
                ]
            elif package == "numpy":
                alt_commands = [
                    "pip install numpy --only-binary=all"
                ]
            else:
                continue
            
            success = False
            for alt_command in alt_commands:
                if run_command(alt_command, f"Installing {name} (alternative method)"):
                    success = True
                    break
            
            if not success:
                print(f"❌ Failed to install {name} with all methods")
                return False
    
    return True

def install_dev_dependencies():
    """Install development dependencies (optional)"""
    print("📦 Installing development dependencies (optional)...")
    dev_packages = ["pytest", "pytest-asyncio"]
    
    for package in dev_packages:
        command = f"pip install {package}"
        if not run_command(command, f"Installing {package}"):
            print(f"⚠️  Failed to install {package} (optional, continuing...)")
    
    return True

def verify_installation():
    """Verify that key packages are installed"""
    print("🔍 Verifying installation...")
    
    test_imports = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("cv2", "OpenCV"),
        ("ultralytics", "Ultralytics"),
        ("numpy", "NumPy"),
        ("socketio", "Socket.IO")
    ]
    
    failed_imports = []
    
    for module, name in test_imports:
        try:
            __import__(module)
            print(f"✅ {name} imported successfully")
        except ImportError as e:
            print(f"❌ {name} import failed: {e}")
            failed_imports.append(name)
    
    if failed_imports:
        print(f"\n⚠️  Some packages failed to import: {', '.join(failed_imports)}")
        return False
    else:
        print("🎉 All packages imported successfully!")
        return True

def create_alternative_requirements():
    """Create alternative requirements file for problematic environments"""
    print("📝 Creating alternative requirements file...")
    
    alt_requirements = """# Alternative requirements for Python 3.13+
# Use this if the main requirements.txt fails

# Core dependencies (minimal versions)
fastapi
uvicorn[standard]
pydantic
python-socketio
python-multipart

# Build tools
setuptools
wheel

# Computer Vision (alternative versions)
opencv-python-headless
ultralytics
numpy

# Utilities
python-dotenv
requests
aiofiles

# Development (optional)
pytest
pytest-asyncio
"""
    
    with open("requirements_alt.txt", "w") as f:
        f.write(alt_requirements)
    
    print("✅ Created requirements_alt.txt")

def main():
    """Main installation function"""
    print("🚀 CV Model Backend - Dependency Installation")
    print("=" * 50)
    
    # Check Python version
    python_version = check_python_version()
    if python_version == "incompatible":
        print("❌ Incompatible Python version. Please use Python 3.8+")
        return False
    
    # Install build tools first
    if not install_build_tools():
        print("❌ Failed to install build tools")
        return False
    
    # Install core dependencies
    if not install_core_dependencies():
        print("❌ Failed to install core dependencies")
        return False
    
    # Install CV dependencies
    if not install_cv_dependencies():
        print("❌ Failed to install CV dependencies")
        if python_version == "3.13+":
            print("🔄 Trying alternative installation method...")
            create_alternative_requirements()
            print("📋 Please try: pip install -r requirements_alt.txt")
        return False
    
    # Install dev dependencies (optional)
    install_dev_dependencies()
    
    # Verify installation
    if not verify_installation():
        print("❌ Installation verification failed")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 Installation completed successfully!")
    print("\n📋 Next steps:")
    print("1. Create .env file: cp .sample.env .env")
    print("2. Edit .env with your configuration")
    print("3. Start the service: python cv-model.py")
    print("4. Test the installation: python test_cv_model.py")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
