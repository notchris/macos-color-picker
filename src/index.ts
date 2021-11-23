import {
    QApplication,
    QClipboard,
    QMainWindow,
    QSystemTrayIcon,
    QIcon,
    QColorDialog,
    QColor,
    QShortcut,
    QKeySequence,
    FocusReason,
    QMenu,
    QAction,
    WindowState,
} from "@nodegui/nodegui";
import { Dock } from "@nodegui/os-utils";
import Color from "color";
import icon from "./icon.png";

// Hide the dock icon on MacOS
Dock.hide();

class App {
    menu: QMenu;
    win: QMainWindow;
    colorDialog: QColorDialog;
    copyHexAction: QAction;
    copyRgbAction: QAction;
    quitAction: QAction;
    showAction: QAction;
    tray: QSystemTrayIcon;
    clipboard: QClipboard;

    constructor() {
        this.menu = new QMenu();
        this.win = new QMainWindow();
        this.win.setWindowTitle("Color Picker");
        this.win.setFixedSize(1, 1);

        // Set tray icon & init context menu
        const trayIcon = new QIcon(icon);
        this.tray = new QSystemTrayIcon();
        this.tray.setIcon(trayIcon);
        this.tray.setContextMenu(this.menu);
        this.tray.show();

        this.copyHexAction = new QAction();
        this.copyRgbAction = new QAction();
        this.quitAction = new QAction();
        this.showAction = new QAction();

        // App Clipboard
        this.clipboard = QApplication.clipboard();

        // Color dialog
        this.colorDialog = new QColorDialog();

        this.initDefault();
    }

    initDefault() {
        this.colorDialog.setCurrentColor(new QColor("black"));
        this.win.show();
        this.win.setWindowOpacity(0);
        this.colorDialog.open();
        this.win.setFocus(FocusReason.OtherFocusReason);
        this.win.activateWindow();

        this.initMenu();

        (global as any).win = this.win;
        (global as any).systemTray = this.tray;
    }

    resetMenu() {
        // Due to a glitch with nodegui, we have to reset the menu after each trigger
        this.copyHexAction.removeEventListener("triggered", () => {});
        this.copyRgbAction.removeEventListener("triggered", () => {});
        this.quitAction.removeEventListener("triggered", () => {});
        this.showAction.removeEventListener("triggered", () => {});
        this.menu.removeAction(this.copyHexAction);
        this.menu.removeAction(this.copyRgbAction);
        this.menu.removeAction(this.quitAction);
        this.menu.removeAction(this.showAction);

        this.initMenu();
    }

    initMenu() {
        // Add tray actions
        this.copyHexAction = new QAction();
        this.copyHexAction.setText("Copy Hex");
        this.copyHexAction.setShortcut(new QKeySequence("Ctrl+c"));

        this.copyRgbAction = new QAction();
        this.copyRgbAction.setText("Copy RGB");

        this.quitAction = new QAction();
        this.quitAction.setText("Quit");

        this.showAction = new QAction();
        this.showAction.setText("Show Picker");

        // On quit action
        this.quitAction.addEventListener("triggered", () => {
            const app = QApplication.instance();
            app.exit(0);
        });

        // On show picker action
        this.showAction.addEventListener("triggered", () => {
            if (!this.colorDialog.isVisible()) {
                this.colorDialog.open();
            } else {
                this.win.setWindowState(WindowState.WindowActive);
                this.win.raise();
            }
            this.resetMenu();
        });

        // On copy hex action
        this.copyHexAction.addEventListener("triggered", () => {
            const c = this.colorDialog.currentColor();
            const color = Color.rgb(c.red(), c.green(), c.blue());
            this.clipboard.setText(`${color.hex()}`);
            this.resetMenu();
        });

        // On copy rgb action
        this.copyRgbAction.addEventListener("triggered", () => {
            const c = this.colorDialog.currentColor();
            this.clipboard.setText(`rgb(${c.red()},${c.green()},${c.blue()})`);
            this.resetMenu();
        });

        // Add initial action instances to menu
        this.menu.addAction(this.showAction);
        this.menu.addAction(this.copyHexAction);
        this.menu.addAction(this.copyRgbAction);
        this.menu.addSeparator();
        this.menu.addAction(this.quitAction);
    }
}

new App();
