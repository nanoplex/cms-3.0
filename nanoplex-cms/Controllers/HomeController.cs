using System.Web.Mvc;
using cms;
using System.Threading.Tasks;
using MongoDB.Driver;

namespace nanoplex_cms.Controllers
{
    public class HomeController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }
    }
}