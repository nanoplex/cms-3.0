using cms.Models;
using Newtonsoft.Json;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;

namespace cms.Controllers
{
    public class HomeController : Controller
    {
        static Site Site = new Site();

        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }
        
        [HttpGet]
        public async Task<string> GetSite()
        {
            await Site.GetSite();

            Site.Pages = Site.Pages.Where(p => p.Visible).ToList();

            return JsonConvert.SerializeObject(Site);
        }
    }
}